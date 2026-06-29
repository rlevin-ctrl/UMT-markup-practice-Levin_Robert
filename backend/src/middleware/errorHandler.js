import HttpError from "../helpers/HttpError.js";

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof HttpError) {
        res.status(err.status).json({ message: err.message });
        return;
    }

    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
        res.status(400).json({ message: err.message });
        return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "File is too large." });
        return;
    }

    if (err.message === "Invalid file type") {
        res.status(400).json({ message: "Invalid file type. Upload JPEG, PNG or WebP." });
        return;
    }

    res.status(500).json({ message: "Internal Server Error" });
}
