import { Auth } from "../db/models";
// import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { Transaction } from "sequelize";

// Extraemos el secret del .env
const SECRET = process.env.SECRET;

// Creamos una funcion asincrona de bcrypt que es mas seguro que sha
async function getBcryptHash(text: string) {
	// Le decimos que espere el hash del texto recibido y que tenga un retrase de 10 ms
	const passHashed = await bcrypt.hash(text, 10);
	return passHashed; // Retornamos el texto hasheado
}

// Creamos la funcion para autorizar un registro (recibimos email, password y userId. Tambien recibe una transaction de forma opcional que es de tipo Transaction de sequelize)
async function authRegister(
	email: string,
	password: string,
	userId: number,
	transaction?: Transaction
) {
	try {
		// Hasheamos la contraseña recibida
		const passHashed = await getBcryptHash(password);

		// Destructuramos en un array lo que nos de el findOrCreate (1. El elemento creado 2. El estado de creacion)
		const [auth, authCreated] = await Auth.findOrCreate({
			where: { userId }, // Buscamos en auth el userId
			defaults: {
				// Si no existe, lo creamos con las propiedades recibidas
				userId,
				email,
				password: passHashed, // Convertimos la password en un bcrypt
			},
			transaction, // Le decimos que su propiedad transaction es lo recibido en el parametro transaction
		});

		return await auth.get("userId"); // Retornamos el userId obtenido
	} catch (error) {
		// Si hay un error
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

// Creamos la funcion para autorizar un login (recibimos email y password)
async function authLogIn(email: string, password: string) {
	try {
		// Hacemos un findOne donde buscamos el email recibido y el password en sha256 en la tabla Auth
		const findAuth = await Auth.findOne({ where: { email } });

		// Obtenemos el password del findAuth
		const findAuthPassword = (await findAuth.get("password")) as string;

		// Verificamos si la comparacion del password recibido y el password guardado en la db son iguales
		if (await bcrypt.compare(password, findAuthPassword)) {
			// Creamos un token con jwt guardando el id
			const token = generateToken(findAuth.get("userId") as number);
			return token; // Y retornamos el token
		} else {
			// Si no encontro el user
			throw new Error("email or password incorrect"); // Tiramos error
		}
	} catch (error) {
		// Si hay un error
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

function generateToken(userId: number) {
	return jwt.sign({ id: userId }, SECRET);
}

// Verificar un token
function verifyToken(token: string) {
	try {
		return jwt.verify(token, SECRET);
	} catch (error) {
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

async function updatePassword(userId: number, newPassword: string) {
    const newPasswordHashed = await getBcryptHash(newPassword)

	const [ count ] = await Auth.update(
		{ password: newPasswordHashed },
		{ where: { userId } }
	);

    return count;
}

export { authRegister, authLogIn, generateToken, verifyToken, updatePassword };
