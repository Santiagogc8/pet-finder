// Hacemos las importaciones de user y authRegister
import { sequelize } from "../db";
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
	const t = await sequelize.transaction(); // Esperamos la creacion de una transaccion

	try { // Intentamos
		const [user, userCreated] = await User.findOrCreate({ // Encontrar
			where: { email }, // El email recibido
			defaults: { // Y si no lo encuentra, lo crea
				name,
				email,
				lat,
				lng,
			},
			transaction: t // Le definimos la propiedad transaction con la transaccion que guardamos en t
		});

        const newUserId = user.get('id') as number; // Extrae el id del user creado o encontrado

		// Y lo pasa por la funcion authRegister (junto con la transaccion)
        const registerStatus = await authRegister(email, password, newUserId, t);

        if(registerStatus === newUserId){ // Si el estado de registro nos devuelve el mismo id
			await t.commit(); // Guardamos la transaccion si sale todo bien
            return { // Retornamos informacion que no comprometa al usuario
				userId: newUserId,
				email
			}
        } else { // Si no
			await t.rollback(); // Deshace todo lo de la transaccion
            return registerStatus // Retornamos el estado
        }
	} catch (error) {
		// Si hay un error
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

// Creamos una funcion que nos extraera la informacion de un usuario. Recibe un id
async function getUserById(id: number) {
	// Obtiene un User por su PK y le pasa el id
	const userData = await User.findByPk(id);
	return userData; // Y lo devuelve
}

async function verifyUserExist(email: string) {
	// Usamo findOne. Si encuentra 1, devuelve true. Si no, false.
	const exists = await User.findOne({where: { email }});

	return !!exists; // El doble signo de exclamación convierte el objeto en booleano puro
}

export { registerUser, getUserById, verifyUserExist };