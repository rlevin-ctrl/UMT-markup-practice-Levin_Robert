import multer from "multer";
import path from "node:path";
import { tempDir } from "../helpers/photoStorage.js";

const storage = multer.diskStorage({
    destination: tempDir,
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    },
});

const allowed = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.has(ext)) {
        cb(new Error("Invalid file type"));
        return;
    }
    cb(null, true);
}

export const uploadPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
}).single("photo");
