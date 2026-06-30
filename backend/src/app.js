import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import bouquetsRouter from "./routes/bouquetsRouter.js";
import bestsellersRouter from "./routes/bestsellersRouter.js";
import feedbacksRouter from "./routes/feedbacksRouter.js";
import ordersRouter from "./routes/ordersRouter.js";
import errorHandler from "./middleware/errorHandler.js";
import swaggerDocument from "../swagger/swagger.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photosPath = path.join(__dirname, "../public/photos");

const app = express();

function normalizeOrigin(value) {
    try {
        return new URL(value).origin;
    } catch {
        return value.replace(/\/+$/, "");
    }
}

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((item) => normalizeOrigin(item.trim()))
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.length === 0) {
                callback(null, true);
                return;
            }

            const requestOrigin = normalizeOrigin(origin);
            if (allowedOrigins.includes(requestOrigin)) {
                callback(null, true);
                return;
            }

            callback(null, false);
        },
    }),
);
app.use(express.json());

app.use("/photos", express.static(photosPath));
app.use("/api/bouquets", bouquetsRouter);
app.use("/api/bestsellers", bestsellersRouter);
app.use("/api/feedbacks", feedbacksRouter);
app.use("/api/orders", ordersRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use(errorHandler);

export default app;
