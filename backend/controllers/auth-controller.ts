import { Auth } from "../db/models";
// import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from "sequelize";
import { resend } from "../lib/resend";

// Extraemos el secret del .env
const SECRET = process.env.SECRET;
const FRONTURL = process.env.FRONTEND_URL;

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

async function requestPasswordReset(email: string) {
	const findAuth = await Auth.findOne({
		where: { email }
	});

	if(!findAuth) throw new Error('user not found');

	const token = uuidv4();
	const expirationDate = new Date(Date.now() + 30 * 60 * 1000);

	const [count] = await Auth.update({
		token,
		expirationDate
	}, {where: {email}});

	resend.emails.send({
		from: 'PetFinder App <onboarding@resend.dev>',
		to: email,
		subject: "Tu enlace para recuperar la contraseña de Pet Finder App",
		html: `
			<p>Este es tu enlace de recuperacion de contraseña</p>
			<a href="${FRONTURL}/reset-password?id=${token}">Recupera tu contraseña</a>
		`
	});

	return count;
}

async function resetPassword(token: string, newPassword: string) {
	const findAuth = await Auth.findOne({
		where: { token }
	});

	if(!findAuth) throw new Error('unauthorized');

	if(findAuth.get().expirationDate < Date.now()){

		findAuth.token = null;
		findAuth.expirationDate = null;

		await findAuth.save();

		throw new Error('time expired');
	}

	const newPasswordHashed = await getBcryptHash(newPassword);

	findAuth.token = null;
	findAuth.expirationDate = null;
	findAuth.password = newPasswordHashed;

	// 2. Guardamos los cambios permanentemente
	return await findAuth.save();
}

export { authRegister, authLogIn, generateToken, verifyToken, updatePassword, requestPasswordReset, resetPassword };
