import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class Pet extends Model {}

Pet.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lost: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    imageUrl: DataTypes.STRING
    // Faltaria el id del user pero ese lo agregariamos directamente desde otro archivo con todas las relaciones
}, {sequelize, modelName: 'Pet'})