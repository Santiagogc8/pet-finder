import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class Report extends Model {}

Report.init({
    name : DataTypes.STRING,
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: DataTypes.TEXT
}, {sequelize, modelName: 'Report'})