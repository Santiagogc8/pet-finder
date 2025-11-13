// Hacemos las importaciones necesarias
import express from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";

const port = process.env.PORT; // Establecemos el puerto recuperado de las variables de entorno
const app = express(); // Inicializamos express

app.use(cors()); // Le decimos que la app usara el middleware de cors
app.use(express.json()); // Y que usara el middleware de json de express para recibir peticiones

app.get("/test", (req, res) => {
    res.json({ok: true})
});

// Le decimos a express que de todas las peticiones get "/(.*)/"
app.get(/(.*)/, (req, res) => {
    // Le pasamos la ruta con resolve en el directorio en el que estamos mas la ruta donde esta el index.html 
	const route = path.resolve(__dirname, "../../client/dist/index.html");
	res.sendFile(route); // Y respondemos enviando el archivo index.html
});

app.listen(port, () => {
	console.log(`app listen on http://localhost:${port}`);
});