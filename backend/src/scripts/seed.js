import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sequelize from "../db/sequelize.js";
import Bouquet from "../models/Bouquet.js";
import { buildGravatarUrl } from "../helpers/gravatar.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../db.json");

function parsePrice(value) {
    const num = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
}

function resolveSeedPhotoUrl(item) {
    if (item.img) return item.img;
    if (item.photoURL) return item.photoURL;
    return buildGravatarUrl(item.title);
}

async function seed() {
    const raw = await fs.readFile(dbPath, "utf8");
    const data = JSON.parse(raw);
    const source = Array.isArray(data.bouquets) ? data.bouquets : [];

    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    for (const item of source) {
        await Bouquet.create({
            title: item.title,
            description: item.desc ?? item.description ?? "",
            price: parsePrice(item.price),
            favorite: Boolean(item.favorite),
            photoURL: resolveSeedPhotoUrl(item),
        });
    }

    console.log(`Seeded ${source.length} bouquets`);
    process.exit(0);
}

seed().catch((error) => {
    console.error("Seed failed:", error.message || error);
    console.error("\nTip: PostgreSQL must be running and DATABASE_URL in backend/.env must be correct.");
    console.error("Example: postgres://postgres:yourpassword@localhost:5432/flora");
    process.exit(1);
});
