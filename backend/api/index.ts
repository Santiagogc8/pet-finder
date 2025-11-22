// Hacemos las importaciones necesarias
import express from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import { sequelize } from "../db";
import { Request, Response, NextFunction } from "express"; // Importaciones para el middleware

// Controllers
import { registerUser, getUserById } from "../controllers/user-controller";
import { authLogIn, verifyToken } from "../controllers/auth-controller";
import { createPet } from "../controllers/pet-controller";

const port = process.env.PORT; // Establecemos el puerto recuperado de las variables de entorno
const app = express(); // Inicializamos express

app.use(cors()); // Le decimos que la app usara el middleware de cors
app.use(express.json()); // Y que usara el middleware de json de express para recibir peticiones

// Creamos un middleWare para obtener el authorization del header. Recibe el req, el res y la funcion next
function authMiddleware(req: Request, res: Response, next: NextFunction) {
	const headerAuth = req.get("Authorization"); // Obtenemos el header Authorization

	// Si no se recibio, tiramos error
	if (!headerAuth) return res.status(401).json({ error: "not token provided" });

	// Partimos el token cuando haya un espacio y accedemos a la posicion 1 del array devuelto
	const token = headerAuth.split(" ")[1];
	if (!token) return res.status(401).json({ error: "token malformed" }); // Si el token es algo raro, tiramos error

	req.token = token; // Guardamos el token en req.token
	next(); // Continuamos el flujo
}

// sequelize.sync({force: true}).then(e => e)
// sequelize.sync({alter: true}).then(e => e)

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
	const token = req.token; // Guardamos el token en una variable

	// Si no recibimos token, tiramos error
	if (!token) return res.status(400).json({ error: "token was expected" });

	try {
		// Intentamos
		const tokenRes = verifyToken(token); // Verificar el token recibido
		if (tokenRes) {
			// Si el token no devuelve null
			// Llamamos a la funcion que nos obtiene un usuario por su PK y le pasamos el id de tokenRes
			const userData = await getUserById(tokenRes.id);
			return res.json(userData); // Respondemos con la data del usuario recibido
		} else {
			// Caso contrario
			// Tiramos un 401
			return res.status(401).json({ error: "token invalid" });
		}
	} catch (error) {
		// Si hay error
		// Tiramos error con el mesaje del error
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

// Crear una mascota
// Debemos verificar que el usuario si exista y luego crear la mascota con el id de este usuario
app.post("/pets", authMiddleware, async (req, res) => {
    const token = req.token; // Guardamos el token en una variable
    const body = req.body;

	// Si no recibimos token, tiramos error
	if (!token) return res.status(400).json({ error: "token was expected" });

    try {
		// Intentamos
		const tokenRes = verifyToken(token); // Verificar el token recibido
		if (tokenRes) {
			// Si el token no devuelve null
			const petCreated = await createPet(tokenRes.id, body) as any;

            if(petCreated.error) throw new Error(petCreated.error)

            return res.json(petCreated);
		} else {
			// Caso contrario
			// Tiramos un 401
			return res.status(401).json({ error: "token invalid" });
		}
	} catch (error) {
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