import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import bouquetsRouter from "./routes/bouquetsRouter.js";
import errorHandler from "./middleware/errorHandler.js";
import swaggerDocument from "../swagger/swagger.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photosPath = path.join(__dirname, "../public/photos");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    }),
);
app.use(express.json());

app.use("/photos", express.static(photosPath));
app.use("/api/bouquets", bouquetsRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use(errorHandler);

export default app;
