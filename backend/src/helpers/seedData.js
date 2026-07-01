import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Bouquet from "../models/Bouquet.js";
import Bestseller from "../models/Bestseller.js";
import Feedback from "../models/Feedback.js";
import { buildGravatarUrl } from "./gravatar.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../frontend/db.json");

function parsePrice(value) {
    const num = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
}

function resolveSeedPhotoUrl(item) {
    if (item.img) return item.img;
    if (item.photoURL) return item.photoURL;
    return buildGravatarUrl(item.title);
}

async function seedCollection(Model, source, mapItem, { force = false } = {}) {
    if (source.length === 0) return 0;

    const existingCount = await Model.count();
    if (existingCount > 0 && !force) {
        return 0;
    }

    if (force) {
        await Model.destroy({ where: {}, truncate: true, restartIdentity: true });
    }

    for (const item of source) {
        await Model.create(mapItem(item));
    }

    return source.length;
}

export async function loadDbSeedData() {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw);
}

export async function seedDatabase({ force = false } = {}) {
    const data = await loadDbSeedData();

    const bouquets = Array.isArray(data.bouquets) ? data.bouquets : [];
    const bestsellers = Array.isArray(data.bestsellers) ? data.bestsellers : [];
    const feedbacks = Array.isArray(data.feedbacks) ? data.feedbacks : [];

    const bouquetsCount = await seedCollection(
        Bouquet,
        bouquets,
        (item) => ({
            title: item.title,
            description: item.desc ?? item.description ?? "",
            price: parsePrice(item.price),
            favorite: Boolean(item.favorite),
            photoURL: resolveSeedPhotoUrl(item),
        }),
        { force },
    );

    const bestsellersCount = await seedCollection(
        Bestseller,
        bestsellers,
        (item) => ({
            title: item.title,
            description: item.desc ?? item.description ?? "",
            longDescription: item.longDesc ?? item.longDescription ?? item.desc ?? "",
            price: parsePrice(item.price),
            photoURL: resolveSeedPhotoUrl(item),
        }),
        { force },
    );

    const feedbacksCount = await seedCollection(
        Feedback,
        feedbacks,
        (item) => ({
            text: item.text,
            author: item.author,
        }),
        { force },
    );

    return { bouquetsCount, bestsellersCount, feedbacksCount };
}
