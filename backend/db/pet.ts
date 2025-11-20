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
}, {sequelize, modelName: 'Pet'})