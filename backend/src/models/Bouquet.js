import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Bouquet = sequelize.define(
    "Bouquet",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        photoURL: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        favorite: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "bouquets",
        timestamps: true,
    },
);

export default Bouquet;
