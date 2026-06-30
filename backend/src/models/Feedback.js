import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Feedback = sequelize.define(
    "Feedback",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
    },
    {
        tableName: "feedbacks",
        timestamps: true,
    },
);

export default Feedback;
