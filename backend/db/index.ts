import { Sequelize } from "sequelize"; // Importamos sequelize

// Inicializamos el objeto Sequelize y le pasamos el link de la conexion
export const sequelize = new Sequelize('postgresql://neondb_owner:npg_tBqJrZ9Vng8I@ep-autumn-mode-ahlwgasj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');