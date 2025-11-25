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
    petId: number;
}

async function createReport(data: ReportData) {
    try{
        if(!data.petId) throw new Error('petId is required');

        const reporterName = data.name || 'anonymous';

        const petFind = await getPetById(data.petId) as any;

        if(petFind.error) return petFind.error;

        const findReport = await Report.findOne({ where: {name: reporterName, message: data.message, lastSeen: data.lastSeen}})

        if(findReport){
            throw new Error('you cannot post 2 identical reports')
        } else {
            const reportCreated = await Report.create(
                {
                    name: reporterName,
                    lastSeen: data.lastSeen,
                    phone: data.phone,
                    lat: data.lat,
                    lng: data.lng,
                    message: data.message,
                    PetId: data.petId
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