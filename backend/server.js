import dotenv from "dotenv";
import app from "./src/app.js";
import sequelize from "./src/db/sequelize.js";
import "./src/models/Bouquet.js";
import "./src/models/Bestseller.js";
import "./src/models/Feedback.js";
import { ensureStorageDirs } from "./src/helpers/photoStorage.js";
import { seedDatabase } from "./src/helpers/seedData.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
    try {
        await ensureStorageDirs();
        await sequelize.authenticate();
        console.log("Database connection successful");
        await sequelize.sync();
        const seeded = await seedDatabase();
        if (seeded.bestsellersCount || seeded.feedbacksCount || seeded.bouquetsCount) {
            console.log(
                `Initial data seeded: bouquets=${seeded.bouquetsCount}, bestsellers=${seeded.bestsellersCount}, feedbacks=${seeded.feedbacksCount}`,
            );
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error.message);
        process.exit(1);
    }
}

startServer();
