import { User } from "../db/user";
import { authRegister } from "./auth-controller";

interface userData {
	name: string;
	email: string;
    password: string;
	lat: number;
	lng: number;
}

async function registerUser(data: userData) {
	const { name, email, password, lat, lng } = data;

	try {
		const [user, userCreated] = await User.findOrCreate({
			where: { email },
			defaults: {
				name,
				email,
				lat,
				lng,
			},
		});

        const newUserId = user.get('id') as number;

        const registerStatus = await authRegister(email, password, newUserId);

        if(registerStatus === newUserId){
            return registerStatus
        } else {
            return registerStatus
        }
	} catch (error) {
		// Si hay un error
		return { error: `an error has ocurred: ${error.message}` }; // Lo retornamos
	}
}

export { registerUser };