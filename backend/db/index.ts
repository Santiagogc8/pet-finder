import { Sequelize } from "sequelize"; // Importamos sequelize

// Inicializamos el objeto Sequelize y le pasamos el link de la conexion
export const sequelize = new Sequelize(process.env.SEQUELIZE);