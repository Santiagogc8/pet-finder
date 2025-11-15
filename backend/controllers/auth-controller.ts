import { Auth } from "../db/models";
import * as crypto from "crypto";

// Funcion para crear un hash sha256 y proteger contraseñas
function getSHA256ofString(text: string) {
	return crypto // Retornamos a crypto
    .createHash("sha256") // Que crea un hash sha256
    .update(text) // Que actualiza el texto a sha256
    .digest("hex"); // Y resuelve con el sha256 en hexadecimal
}

async function authRegister(email: string, password: string, userId: number) {
	try {
		const [auth, authCreated] = await Auth.findOrCreate({
            where: { userId },
            defaults: {
                userId,
                email,
                password: getSHA256ofString(password)
            }
        });

        return auth.get().userId
	} catch (error) {
        return {error: `an error has ocurred: ${error.message}`}
    }
}

export { authRegister };