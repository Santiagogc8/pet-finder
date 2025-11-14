import { DataTypes, Model } from "sequelize"; // Importamos los tipos de dato y modelo de sequelize
import { sequelize } from ".";

class User extends Model {}

User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING
}, { sequelize, modelName: "User" });