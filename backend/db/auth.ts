import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class Auth extends Model {}

Auth.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: "Auth" });
