import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sequelize from "../db/sequelize.js";
import Bouquet from "../models/Bouquet.js";
import Bestseller from "../models/Bestseller.js";
import Feedback from "../models/Feedback.js";
import { buildGravatarUrl } from "../helpers/gravatar.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../db.json");
const forceReset = process.argv.includes("--force");

function parsePrice(value) {
    const num = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
}

function resolveSeedPhotoUrl(item) {
    if (item.img) return item.img;
    if (item.photoURL) return item.photoURL;
    return buildGravatarUrl(item.title);
}

async function seedCollection(Model, source, mapItem) {
    if (source.length === 0) return 0;

    const existingCount = await Model.count();
    if (existingCount > 0 && !forceReset) {
        return 0;
    }

    if (forceReset) {
        await Model.destroy({ where: {}, truncate: true, restartIdentity: true });
    }

    for (const item of source) {
        await Model.create(mapItem(item));
    }

    return source.length;
}

async function seed() {
    const raw = await fs.readFile(dbPath, "utf8");
    const data = JSON.parse(raw);

    await sequelize.authenticate();
    await sequelize.sync(forceReset ? { force: true } : undefined);

    const bouquets = Array.isArray(data.bouquets) ? data.bouquets : [];
    const bestsellers = Array.isArray(data.bestsellers) ? data.bestsellers : [];
    const feedbacks = Array.isArray(data.feedbacks) ? data.feedbacks : [];

    const bouquetsCount = await seedCollection(Bouquet, bouquets, (item) => ({
        title: item.title,
        description: item.desc ?? item.description ?? "",
        price: parsePrice(item.price),
        favorite: Boolean(item.favorite),
        photoURL: resolveSeedPhotoUrl(item),
    }));

    const bestsellersCount = await seedCollection(Bestseller, bestsellers, (item) => ({
        title: item.title,
        description: item.desc ?? item.description ?? "",
        longDescription: item.longDesc ?? item.longDescription ?? item.desc ?? "",
        price: parsePrice(item.price),
        photoURL: resolveSeedPhotoUrl(item),
    }));

    const feedbacksCount = await seedCollection(Feedback, feedbacks, (item) => ({
        text: item.text,
        author: item.author,
    }));

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
