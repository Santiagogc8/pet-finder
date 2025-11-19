// Hacemos las importaciones de user y authRegister
import { User } from "../db/user";
import { authRegister } from "./auth-controller";

interface userData { // Definimos la interfaz de la data del user para que sea mas sencillo de manejar
	name: string;
	email: string;
    password: string;
	lat: number;
	lng: number;
}

// Creamos una funcion asincrona para registrar el user. Recibe una data del tipo userData
async function registerUser(data: userData) {
	const { name, email, password, lat, lng } = data; // Extraemos las propiedades de la data

	try { // Intentamos
		const [user, userCreated] = await User.findOrCreate({ // Encontrar
			where: { email }, // El email recibido
			defaults: { // Y si no lo encuentra, lo crea
				name,
				email,
				lat,
				lng,
			},
		});

        const newUserId = user.get('id') as number; // Extrae el id del user creado o encontrado

		// Y lo pasa por la funcion authRegister
        const registerStatus = await authRegister(email, password, newUserId);

        if(registerStatus === newUserId){ // Si el estado de registro nos devuelve el mismo id
            return registerStatus // Lo retornamos
        } else { // Si no
            return registerStatus // Retornamos el estado
        }
	} catch (error) {
		// Si hay un error
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

export { registerUser };