import { DataTypes, Model } from "sequelize"; // Importamos los tipos de dato y modelo de sequelize
import { sequelize } from ".";

export class User extends Model {}

User.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false // No acepta un valor vacio
    },
    email: {
        type: DataTypes.STRING,
        unique: true, // Le decimos que su valor es unico y no puede haber uno igual en la columna
        allowNull: false // No acepta un valor vacio
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false // No acepta un valor vacio
    },
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
}, { sequelize, modelName: "User" });