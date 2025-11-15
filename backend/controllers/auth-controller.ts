import { Auth } from "../db/models";
import * as crypto from "crypto";
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.SECRET;

// Funcion para crear un hash sha256 y proteger contraseñas
function getSHA256ofString(text: string) {
	return crypto // Retornamos a crypto
    .createHash("sha256") // Que crea un hash sha256
    .update(text) // Que actualiza el texto a sha256
    .digest("hex"); // Y resuelve con el sha256 en hexadecimal
}

// Creamos la funcion para autorizar un registro (recibimos email, password y userId)
async function authRegister(email: string, password: string, userId: number) {
	try {
        // Destructuramos en un array lo que nos de el findOrCreate (1. El elemento creado 2. El estado de creacion)
		const [auth, authCreated] = await Auth.findOrCreate({
            where: { userId }, // Buscamos en auth el userId
            defaults: { // Si no existe, lo creamos con las propiedades recibidas
                userId,
                email,
                password: getSHA256ofString(password) // Convertimos la password en un sha256
            }
        });

        return auth.get('userId') // Retornamos el userId obtenido 
	} catch (error) { // Si hay un error
        return {error: `an error has ocurred: ${error.message}`}; // Lo retornamos
    }
}

// Creamos la funcion para autorizar un login (recibimos email y password)
async function authLogIn(email: string, password: string) {
    try{
        // Hacemos un findOne donde buscamos el email recibido y el password en sha256 en la tabla Auth
        const findAuth = await Auth.findOne({where: {email, password: getSHA256ofString(password)}});

        if(findAuth){ // Si encontro el user
            // Creamos un token con jwt guardando el id
            const token = jwt.sign({id: findAuth.get('userId')}, SECRET);
            return token; // Y retornamos el token
        } else { // Si no encontro el user
            throw new Error('email or password incorrect'); // Tiramos error
        }
    } catch(error){ // Si hay un error
        return {error: `an error has ocurred: ${error.message}`} // Lo retornamos
    }
}

export { authRegister, authLogIn };