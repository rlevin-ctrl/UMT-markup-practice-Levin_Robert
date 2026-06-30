import dotenv from "dotenv";
import sequelize from "../db/sequelize.js";
import Bouquet from "../models/Bouquet.js";
import Bestseller from "../models/Bestseller.js";
import Feedback from "../models/Feedback.js";
import { seedDatabase } from "../helpers/seedData.js";

dotenv.config();

const forceReset = process.argv.includes("--force");

async function seed() {
    await sequelize.authenticate();
    await sequelize.sync(forceReset ? { force: true } : undefined);

    const { bouquetsCount, bestsellersCount, feedbacksCount } = await seedDatabase({
        force: forceReset,
    });

    console.log(
        `Seed complete: bouquets=${bouquetsCount}, bestsellers=${bestsellersCount}, feedbacks=${feedbacksCount}`,
    );
    process.exit(0);
}

seed().catch((error) => {
    console.error("Seed failed:", error.message || error);
    console.error("\nTip: PostgreSQL must be running and DATABASE_URL in backend/.env must be correct.");
    console.error("Example: postgres://postgres:yourpassword@localhost:5432/flora");
    process.exit(1);
});
