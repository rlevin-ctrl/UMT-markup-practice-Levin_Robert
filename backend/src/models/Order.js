import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerName: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        productTitle: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        productPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        bouquetId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "orders",
        timestamps: true,
    },
);

export default Order;
