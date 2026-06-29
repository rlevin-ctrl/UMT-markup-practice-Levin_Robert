import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const useSsl =
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL?.includes("render.com");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

export default sequelize;
