import * as bouquetsService from "../services/bouquetsService.js";
import HttpError from "../helpers/HttpError.js";

export async function getAllBouquets(req, res, next) {
    try {
        const result = await bouquetsService.listBouquets(req.query);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getBouquet(req, res, next) {
    try {
        const bouquet = await bouquetsService.getBouquetById(req.params.id);
        res.status(200).json(bouquet);
    } catch (error) {
        next(error);
    }
}

export async function createBouquet(req, res, next) {
    try {
        const bouquet = await bouquetsService.createBouquet(req.body);
        res.status(201).json(bouquet);
    } catch (error) {
        next(error);
    }
}

export async function updateBouquet(req, res, next) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new HttpError(400, "Request body cannot be empty");
        }
        const bouquet = await bouquetsService.updateBouquet(req.params.id, req.body);
        res.status(200).json(bouquet);
    } catch (error) {
        next(error);
    }
}

export async function deleteBouquet(req, res, next) {
    try {
        await bouquetsService.deleteBouquet(req.params.id);
        res.status(200).json({ message: "Bouquet deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export async function patchFavorite(req, res, next) {
    try {
        const bouquet = await bouquetsService.updateFavorite(req.params.id, req.body.favorite);
        res.status(200).json(bouquet);
    } catch (error) {
        next(error);
    }
}

export async function patchPhoto(req, res, next) {
    try {
        if (!req.file) {
            throw new HttpError(400, "Photo file is required");
        }
        const bouquet = await bouquetsService.updatePhoto(req.params.id, req.file.filename);
        res.status(200).json(bouquet);
    } catch (error) {
        next(error);
    }
}
