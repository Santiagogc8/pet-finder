// Hacemos las importaciones de la clase Pet y uploadImage de cloudinary
import { Pet } from "../db/pet";
import { uploadImage } from "../lib/cloudinary";
import { client, indexName } from "../lib/algolia";
import { User } from "../db/user";

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
				imgUrl: cloudinaryImgSecureUrl,
                "_geoloc": { // Y la geolocalizacion
                    "lat": petData.lat,
                    "lng": petData.lng
                },
				lost: petData.lost
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
			include: {
				model: User,
				attributes: ['email']
			}
		});

		if (!petFind) throw new Error("pet not found"); // Si petFind no retorna nada, tiramos error

		return petFind; // Si petFind devuelve el pet, terminamos la funcion con el petFind
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

// Creamos una funcion para poder buscar mascotas cerca de una lat y lng en algolia
async function searchPetsAround(lat: number, lng: number) {
	const { results } = await client.search({ // Extraemos los results del search del cliente
		requests: [{
			indexName, // Le pasamos el indexName
			aroundLatLng: `${lat}, ${lng}`, // Y el aroundLatLng en string
			aroundRadius: 50000 // metros
		}]
	})

	// Retornamos el results en la posicion 0 y mostramos sus hits
	return (results[0] as any).hits;
}

async function getUserPets(userId: number) {
	try{
		const pets = await Pet.findAll({where: {UserId: userId}});
		return pets;
	} catch(error){
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

async function updatePet(petId: number, userId: number, newData: any) {
	const allowedFields = ['name', 'lat', 'lng', 'lost']; // Qué permitimos
    const updateData: any = {}; // Donde guardaremos los datos que si enviaremos

	if(newData.imgUrl && newData.imgUrl.includes('data:image')){
		const cloudinaryImgSecureUrl = (await uploadImage(newData.imgUrl)) as any;

		if (cloudinaryImgSecureUrl.error) throw new Error(cloudinaryImgSecureUrl.error);

		updateData.imgUrl = cloudinaryImgSecureUrl;
	}

    // Recorremos la lista blanca (allowedFields)
    allowedFields.forEach(field => {
        // Si el dato viene en newData, lo copiamos
        if (newData[field] !== undefined) {
            updateData[field] = newData[field];
        }
    });

	try{
		const [count] = await Pet.update(updateData, {
			where: {
				id: petId,
				UserId: userId
			}
		});

		if (count === 0) {
            throw new Error("pet not found or you are not the owner");
        }

		let algoliaUpdateData = { ...updateData }; // Copia inicial

        // Si hay coordenadas, transformamos la estructura
        if (updateData.lat && updateData.lng) {
            const { lat, lng, ...rest } = updateData;
            algoliaUpdateData = rest; // El objeto sin lat/lng sueltos
            algoliaUpdateData._geoloc = { lat, lng }; // Agregamos la estructura correcta
        }

		const {taskID} = await client.partialUpdateObject({
			indexName,
			objectID: petId.toString(),
			attributesToUpdate: algoliaUpdateData
		})

		return { message: "pet updated successfully", taskID };
	} catch(error){
		return { error: error.message };
	}
}

async function deletePet(petId: number, userId: number) {
	try{
		const petDeleted = await Pet.destroy({
			where: {
				id: petId,
				UserId: userId
			}
		});

		if(petDeleted === 0){
			throw new Error("pet not found or you are not the owner")
		}

		await client.deleteObject({indexName, objectID: petId.toString()})

		return { message: "pet deleted successfully" };
	} catch(error){
		return { error: error.message };
	}
}

export { createPet, getPetById, searchPetsAround, getUserPets, updatePet, deletePet };