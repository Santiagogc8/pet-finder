import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class Report extends Model {}

Report.init({
    lastSeen: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reporterPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    message: DataTypes.TEXT
}, {sequelize, modelName: 'Report'})