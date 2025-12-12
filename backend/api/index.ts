// Hacemos las importaciones necesarias
import express from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import { sequelize } from "../db";

// Controllers
import { registerUser, getUserById, verifyUserExist, updateUserData } from "../controllers/user-controller";
import { authLogIn, verifyToken, updatePassword } from "../controllers/auth-controller";
import { createPet, searchPetsAround, getUserPets, getPetById, updatePet, deletePet } from "../controllers/pet-controller";
import { createReport } from "../controllers/report-controller";

// Middlewares
import { authMiddleware, validateUser } from "../middlewares/middlewares";

const port = process.env.PORT; // Establecemos el puerto recuperado de las variables de entorno
const app = express(); // Inicializamos express

app.use(cors()); // Le decimos que la app usara el middleware de cors
app.use(express.json()); // Y que usara el middleware de json de express para recibir peticiones

// sequelize.sync({force: true}).then(e => e)
// sequelize.sync({alter: true}).then(e => e)

// Buscar un email
// Utilizamos un endpoint para buscar dentro de users un email. Para evitar exponer la data del usuario, usamos POST en vez de GET
app.post('/auth/check-email', async (req, res) =>{
	const { email } = req.body;
	
	if(!email) return res.status(400).json({error: 'an email was expected'});

	try{ // Intentamos
		// Llamar a verifyUserExist con el email recibido
		const exists = await verifyUserExist(email);
		// Respondemos: { exists: true } o { exists: false }
		return res.json({exists}); 
	} catch(error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Sign Up
// Creamos un endpoint para registrar
app.post("/auth/signup", async (req, res) => {
	const body = req.body; // Extraemos el body

	// Si no recibimos nada en el body, tiramos 400
	if (!body) return res.status(400).json({ error: "body request was expected" });

	try {
		// Intentamos
		// Pasarle a la funcion registerUser y esperar la respuesta
		const registerRes = await registerUser(body);
		res.json(registerRes); // Luego retornar la respuesta del registerUser
	} catch (error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Login
// Creamos un endpoint para loguear un user
app.post("/auth/login", async (req, res) => {
	const { email, password } = req.body; // Tomamos el email y contraseña de la request

	// Si no recibimos email o contraseña, tiramos 400
	if (!email || !password)
		return res.status(400).json({ error: "email and password was expected" });

	try {
		// Intentamos
		// Ejecutar authLogIn con los parametros extraidos del req body y esperar la respuesta
		const token = await authLogIn(email, password);
		res.json({ token }); // Retornamos el token creado
	} catch (error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Obtener la informacion del usuario
// Creamos el endpoint /me para obtener la informacion del usuario. Le pasamos el middleware authMiddleware
app.get("/me", authMiddleware, async (req, res) => {
	const payload = req.payload; // Guardamos el token en una variable

	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });

	try {
		// Intentamos
		const userData = await getUserById(payload.id);
		return res.json(userData); // Respondemos con la data del usuario recibido
	} catch (error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

app.patch(`/user`, authMiddleware, async (req, res) => {
	const payload = req.payload; // Guardamos el token en una variable
	const body = req.body;
	
	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });

	const userId = payload.id

	try {
		const countLines = await updateUserData(userId, body);

		return res.json({message: `${countLines} lines has been updated`})
	} catch(error) {
		// Si hay error
		if(error.message == 'user not found'){
			res.status(404).json({ error: `Error ocurred: ${error.message}` });
		} else {
			res.status(500).json({ error: `Error ocurred: ${error.message}` });
		}
	}
});

app.patch('/user/auth', authMiddleware, async (req, res) => {
	const payload = req.payload;
	const { password } = req.body;

	// Si no recibimos payload, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });

	if(!password) return res.status(400).json({ error: "new password was required" });

	const userId = payload.id;

	try {
		const countLines = await updatePassword(userId, password);

		if(countLines === 0 ){
			throw new Error('password cannot be updated');
		}

		return res.json({message: `password updated succesfully`});
	} catch(error) {
		// Si hay error
		if(error.message == 'password cannot be updated'){
			res.status(404).json({ error: `Error ocurred: ${error.message}` });
		} else {
			res.status(500).json({ error: `Error ocurred: ${error.message}` });
		}
	}
});

// Crear una mascota
// Debemos verificar que el usuario si exista y luego crear la mascota con el id de este usuario
app.post("/pets", authMiddleware, async (req, res) => {
    const payload = req.payload; // Guardamos el token en una variable
    const body = req.body;

	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });

    try {
		// Intentamos
		// Si el token no devuelve null
		const petCreated = await createPet(payload.id, body) as any;
        if(petCreated.error) throw new Error(petCreated.error)
        return res.json(petCreated);
	} catch (error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

app.get("/my-pets", authMiddleware, async (req, res) => {
	const payload = req.payload; // Guardamos el token en una variable

	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });

	try{
		const pets = await getUserPets(payload.id);

		return res.json(pets)
	}	catch(error){
		return res.status(500).json({ error: error.message });
	}
});

app.get("/pets/:id", authMiddleware, async (req, res) => {
	const { id } = req.params;

	if(!id) return res.status(400).json({error: "id was expected"});

	try{
		const pet = await getPetById(parseInt(id));

		if ((pet as any).error) {
            return res.status(404).json(pet);
        }

        return res.json(pet);
	} catch(error){
		return res.status(500).json({ error: error.message });
	}
});

app.patch("/pets/:id", authMiddleware, async (req, res) => {
	const { id } = req.params;
	const payload = req.payload;
	const body = req.body;

	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });
	
	if(!id) return res.status(400).json({error: "id was expected"});

	try{
		const response = await updatePet(parseInt(id), parseInt(payload.id), body);

		if(response.error) return res.status(400).json({error: response.error})

		return res.json({message: response.message})
	} catch(error){
		return res.status(500).json({ error: error.message });
	}
});

app.delete("/pets/:id", authMiddleware, async (req, res) => {
	const { id } = req.params;
	const payload = req.payload;

	// Si no recibimos token, tiramos error
	if (!payload) return res.status(401).json({ error: "unauthorized" });
	
	if(!id) return res.status(400).json({error: "id was expected"});

	try{
		const response = await deletePet(parseInt(id), parseInt(payload.id));

		if(response.error) return res.status(400).json({error: response.error})

		return res.json({message: response.message})
	} catch(error){
		return res.status(500).json({ error: error.message });
	}
});

// Creacion de report
// Creamos un endpoint que nos ayudara a crear un nuevo reporte y le pasamos un middleware para que valide si se le paso un auth o no
app.post("/report", async (req, res) => {
	let body = req.body; // Extraemos el body

	try{ // Intentamos
		// Luego esperamos la creacion del reporte y le pasamos el body
		const reportCreated = await createReport(body);

		if(reportCreated.error){ // Si la creacion del reporte da error
			return res.status(400).json({error: reportCreated.error}) // Tiramos un 400 con el error
		} else{ // Si no
			return res.json(reportCreated); // Retornamos el reporte creado
		}
	} catch(error){
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Obtener mascotas cerca de una ubicacion
// Creamos un endpoint para poder encontrar mascotas cerca de una ubicacion
app.get('/pets/around', async(req, res) => {
	const { lat, lng } = req.query; // Extraemos el lat y lng de las querys

	// Si no recibimos lat o lng, tiramos error
	if(!lat || !lng) return res.status(400).json({ error: 'lat and lng was expected' });

	try{ // Intentamos
		// Hacer el searchPetsAround con lat y lng como floats
		const petsArray = await searchPetsAround(parseFloat(lat as string), parseFloat(lng as string));

		res.json({ pets: petsArray }) // Y responder con el array de mascotas encontradas
	} catch(error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Determinamos la ruta absoluta (desde el dist del backend) a la carpeta 'dist' del frontend
// __dirname es 'desafio-integrador-4/backend/dist/api'. Subimos (..) y entramos a 'dist'. Subimos otro nivel y entramos a 'backend'. Por ultimo, subimos el ultimo nivel y entramos a 'pet-finder'
const staticPath = path.join(__dirname, "..", "..", "..", "client", "dist");

// Usamos express.static para servir la carpeta compilada
app.use(express.static(staticPath));

// SPA FALLBACK: Redirigimos todas las demás rutas a index.html
app.get("/{*any}", (req, res) => {
	res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(port, () => {
	console.log(`app listen on http://localhost:${port}`);
});