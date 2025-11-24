// Importamos la clase report
import { Report } from "../db/report";

interface ReportData {
    name?: string;
    phone: number;
    lat: number;
    lng: number;
    message: string;
    petId: number;
}

async function createReport(data: ReportData) {
    
}

export { createReport }