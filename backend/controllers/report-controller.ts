// Importamos la clase report
import { Report } from "../db/report";
import { getPetById } from "./pet-controller";

interface ReportData {
    name?: string;
    lastSeen: string;
    phone: number;
    lat: number;
    lng: number;
    message: string;
}

async function createReport(petId: number, data: ReportData) {
    try{
        const petFind= await getPetById(petId) as any;

        if(petFind.error) return petFind.error;

        const findReport = await Report.findOne({ where: {name: data.name, message: data.message, lastSeen: data.lastSeen}})

        if(findReport){
            throw new Error('you cannot post 2 identical reports')
        } else {
            const reportCreated = await Report.create(
                {
                    name: data.name || 'anonymous',
                    lastSeen: data.lastSeen,
                    phone: data.phone,
                    lat: data.lat,
                    lng: data.lng,
                    message: data.message,
                    PetId: petId
                }
            )

            return reportCreated;
        }

    } catch (error) {
		// Si hay un error
		return { error: `${error.message}` }; // Lo retornamos
	}
}

export { createReport }