// Importamos la clase report
import { Report } from "../db/report";
import { getPetById } from "./pet-controller";

interface ReportData {
	// Creamos la interfaz de reportes
	name?: string;
	lastSeen: string;
	phone: number;
	lat: number;
	lng: number;
	message: string;
	petId: number;
}

// Creamos la funcion para crear reportes. Esta recibe una data
async function createReport(data: ReportData) {
	try {
		// Intentamos
		if (!data.petId) throw new Error("petId is required"); // Revisar si recibimos el petId

		const reporterName = data.name || "anonymous"; // Luego establecemos el nombre recibido o anonymous en una const

		const petFind = (await getPetById(data.petId)) as any; // Obtenemos la mascota con el id que recibimos

		if (petFind.error) return petFind.error; // Si petFind nos trae error, retornamos el error

		// Luego intentamos buscar un reporte que tenga el mismo name, message y ultima vez visto
		const findReport = await Report.findOne({
			where: {
				name: reporterName,
				message: data.message,
				lastSeen: data.lastSeen,
			},
		});

		if (findReport) {
			// Si encontramos un reporte como el que buscabamos
			throw new Error("you cannot post 2 identical reports"); // Tiramos un error
		} else { // Si no
			const reportCreated = await Report.create({ // Creamos el nuevo report
				name: reporterName,
				lastSeen: data.lastSeen,
				phone: data.phone,
				lat: data.lat,
				lng: data.lng,
				message: data.message,
				PetId: data.petId,
			});

			return reportCreated; // Y retornamos el report creado
		}
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

export { createReport };