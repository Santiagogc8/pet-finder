import { Resend } from "resend"; // Importamos resend

export const resend = new Resend(process.env.RESEND_API_KEY); // Y lo instanciamos con la api key de las env variables