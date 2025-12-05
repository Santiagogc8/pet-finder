// Importamos la clase report
import { Report } from "../db/report";
import { getPetById } from "./pet-controller"; // El controller de pet
import { resend } from "../lib/resend"; // Y a resend

interface ReportData {
	// Creamos la interfaz de reportes
	name?: string;
	phone: number;
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
				message: data.message
			},
		});

		if (findReport) {
			// Si encontramos un reporte como el que buscabamos
			throw new Error("you cannot post 2 identical reports"); // Tiramos un error
		} else { // Si no
			const reportCreated = await Report.create({ // Creamos el nuevo report
				name: reporterName,
				phone: data.phone,
				message: data.message,
				PetId: data.petId,
			});

            // Luego usamos resend para enviar un correo al usuario que es dueño de la mascota
            resend.emails.send({
                from: 'onboarding@resend.dev', // Enviamos el correo desde un dominio x
                to: petFind.User.email, // Al email recibido de los atributos extraidos de petFind.User.email
                subject: `Hay nueva informacion sobre ${petFind.name || 'tu mascota'}`, // Le ponemos el asunto
                html: `
                    <p>Alguien ha publicado un reporte sobre tu mascota</p>
                    <ul>
                        <li>
                            <p><strong>Nombre del reportante: </strong>${reporterName}</p>
                        </li>
                        <li>
                            <p><strong>Telefono del reportante: </strong>${data.phone}</p>
                        </li>
                        <li>
                            <p><strong>Mensaje del reportante: </strong>${data.message}</p>
                        </li>
                    </ul>
                ` // Y el html con la informacion de la mascota
            })

			return reportCreated; // Y retornamos el report creado
		}
	} catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

export { createReport };