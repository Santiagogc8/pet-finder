// Hacemos las importaciones de la clase Pet y uploadImage de cloudinary
import { Pet } from "../db/pet";
import { User } from "../db/user";
import { uploadImage } from "../lib/cloudinary";
import { client, indexName } from "../lib/algolia";

interface PetData {
	name: string;
	lost: boolean;
	lat: number;
	lng: number;
	imgUrl: string;
}

// Hacemos una funcion asincrona que creara una mascota. Esta funcion recibe el id del usuario que la va a crear y la data de la mascota
async function createPet(userId: number, petData: PetData) {
	try {
		// Intentamos
		// Encontrar una mascota que
		const findPet = await Pet.findOne({
			where: { UserId: userId, name: petData.name }, // Tenga el userId recibido y el nombre recibido
		});

		if (findPet) {
			// Si existe una mascota con el userId recibido y el nombre recibido
			throw new Error(
				"cannot create a pet that already exists for the same user"
			); // Tiramos un error
		} else {
			// Si no
			const cloudinaryImgSecureUrl = (await uploadImage(petData.imgUrl)) as any;

			if (cloudinaryImgSecureUrl.error)
				throw new Error(cloudinaryImgSecureUrl.error);

			// Creamos una nueva mascota con la data recibida y el userId como FK
			const petCreated = await Pet.create({
				name: petData.name,
				lost: petData.lost,
				lat: petData.lat,
				lng: petData.lng,
				imageUrl: cloudinaryImgSecureUrl,
				UserId: userId,
			});

            const petId = await petCreated.get('id'); // Luego obtenemos el id del petCreated

            const record = {  // Creamos un record para algolia
                objectID: petId.toString(), // Le pasamos el id en string
                name: petData.name, // El nombre
                "_geoloc": { // Y la geolocalizacion
                    "lat": petData.lat,
                    "lng": petData.lng
                }
            };

            // Agregamos el record al indice con saveObject
            const { taskID } = await client.saveObject({
                indexName, // En el indexName
                body: record, // Y con el record creado como body
            });

			return await petCreated; // Retornamos la mascota creada
		}
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}


// Creamos una funcion que nos obtiene una mascota por su id y el email de su dueño. Recibe un petId
async function getPetById(petId: number) {
	try { // Intentamos
        // Obtener una mascota con findByPk y el id recibido
		const petFind = await Pet.findByPk(petId, {

            // Y le pedimos que incluya el atributo email de la propiedad User a la que pertenece este modelo
			include: [{ model: User, attributes: ["email"] }],
		});

		if (!petFind) throw new Error("pet not found"); // Si petFind no retorna nada, tiramos error

		return petFind; // Si petFind devuelve el pet, terminamos la funcion con el petFind
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

export { createPet, getPetById };
