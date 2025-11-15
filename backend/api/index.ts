// Hacemos las importaciones necesarias
import express from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import { sequelize } from "../db";

const port = process.env.PORT; // Establecemos el puerto recuperado de las variables de entorno
const app = express(); // Inicializamos express

app.use(cors()); // Le decimos que la app usara el middleware de cors
app.use(express.json()); // Y que usara el middleware de json de express para recibir peticiones

// sequelize.sync({force: true}).then(e => e)

app.get("/test", async (req, res) => {
    res.json({ok: true})
});

// Determinamos la ruta absoluta (desde el dist del backend) a la carpeta 'dist' del frontend
// __dirname es 'desafio-integrador-4/backend/dist/api'. Subimos (..) y entramos a 'dist'. Subimos otro nivel y entramos a 'backend'. Por ultimo, subimos el ultimo nivel y entramos a 'pet-finder'
const staticPath = path.join(__dirname, '..', '..', '..', 'client', 'dist');

// Usamos express.static para servir la carpeta compilada
app.use(express.static(staticPath));

// SPA FALLBACK: Redirigimos todas las demás rutas a index.html
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, () => {
	console.log(`app listen on http://localhost:${port}`);
});