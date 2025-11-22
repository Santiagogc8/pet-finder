// Hacemos las importaciones de la clase Pet y uploadImage de cloudinary 
import { Pet } from "../db/pet";
import { uploadImage } from "../lib/cloudinary";

interface PetData {
	name: string;
	lost: boolean;
	lat: number;
	lng: number;
	imgUrl: string;
}

// Hacemos una funcion asincrona que creara una mascota. Esta funcion recibe el id del usuario que la va a crear y la data de la mascota
async function createPet(userId: number, petData: PetData) {
	try { // Intentamos
        // Encontrar una mascota que
		const findPet = await Pet.findOne({
			where: { UserId: userId, name: petData.name } // Tenga el userId recibido y el nombre recibido
		});

        if(findPet){ // Si existe una mascota con el userId recibido y el nombre recibido
            throw new Error('cannot create a pet that already exists for the same user'); // Tiramos un error
        } else { // Si no
            const cloudinaryImgSecureUrl = await uploadImage(petData.imgUrl) as any;

            if(cloudinaryImgSecureUrl.error) throw new Error(cloudinaryImgSecureUrl.error)

            // Creamos una nueva mascota con la data recibida y el userId como FK
            const petCreated = await Pet.create({
                name: petData.name,
                lost: petData.lost,
                lat: petData.lat,
                lng: petData.lng,
                imageUrl: cloudinaryImgSecureUrl,
                UserId: userId
            });

            return await petCreated; // Retornamos la mascota creada
        }
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

export { createPet };
