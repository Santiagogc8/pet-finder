// Hacemos las importaciones necesarias
import express from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import { sequelize } from "../db";

// Controllers
import { registerUser } from "../controllers/user-controller";
import { authLogIn } from "../controllers/auth-controller";

const port = process.env.PORT; // Establecemos el puerto recuperado de las variables de entorno
const app = express(); // Inicializamos express

app.use(cors()); // Le decimos que la app usara el middleware de cors
app.use(express.json()); // Y que usara el middleware de json de express para recibir peticiones

// sequelize.sync({force: true}).then(e => e)

app.post("/auth/register", async (req, res) => {
	const body = req.body;

	if (!body) return res.status(400).json({error: "body request was expected"})

	try {
		const registerRes = await registerUser(body);
		res.json(registerRes);
	} catch (error) {
		res.status(500).json({ error: `Error ocurred: ${error.message}` });
	}
});

app.post("/auth/token", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) return res.status(400).json({error: "email and password was expected"})

	try {
		const token = await authLogIn(email, password);
		res.json({ token });
	} catch (error) {
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
