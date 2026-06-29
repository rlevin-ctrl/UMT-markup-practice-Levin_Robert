import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");

export const tempDir = path.join(backendRoot, "temp");
export const photosDir = path.join(backendRoot, "public", "photos");

export async function ensureStorageDirs() {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(photosDir, { recursive: true });
}

export function buildPhotoPublicUrl(filename) {
    const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    return `${base}/photos/${filename}`;
}

export async function moveTempPhotoToPublic(tempFilename) {
    const source = path.join(tempDir, tempFilename);
    const uniqueName = `${Date.now()}-${tempFilename}`;
    const destination = path.join(photosDir, uniqueName);
    await fs.rename(source, destination);
    return uniqueName;
}
