import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Bestseller = sequelize.define(
    "Bestseller",
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
        longDescription: {
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
    },
    {
        tableName: "bestsellers",
        timestamps: true,
    },
);

export default Bestseller;
