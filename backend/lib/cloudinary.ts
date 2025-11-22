// Importamos todo v2 como cloudinary de la cloudinary library
import { v2 as cloudinary } from "cloudinary";

// Retornamos urls https por la configuracion secure: true
cloudinary.config({
	secure: true,
});

const uploadImage = async (imagePath: string) => {
	// Utilizar el nombre del archivo subido como ID público del recurso y
    // permitir sobrescribir el recurso con nuevas versiones
	const options = {
		use_filename: true,
		unique_filename: false,
		overwrite: true,
	};

	try {
		// Sube la imagen
		const result = await cloudinary.uploader.upload(imagePath, options);
		return result.secure_url; // Retorna la url segura
	} catch (error) {
		// Si hay un error
		// Intentamos devolver el mensaje, o el error completo si no hay mensaje
        const errorMessage = error.message || JSON.stringify(error) || "Error desconocido";
        
        return { error: errorMessage };
	}
};

export { uploadImage }