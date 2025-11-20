// Importamos las cosas de sequelize y la inicializacion de la db
import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

// Exportamos la clase auth
export class Auth extends Model {}

// E inicializamos el modelo Auth
Auth.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // No puede tener null
        primaryKey: true // Y le decimos que la propiedad userId es su primaryKey
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Le decimos que su email es unico (no se puede repetir en la columna)
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: "Auth" });
