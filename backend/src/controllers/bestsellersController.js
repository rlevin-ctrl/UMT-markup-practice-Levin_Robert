import * as bestsellersService from "../services/bestsellersService.js";

export async function getAllBestsellers(_req, res, next) {
    try {
        const items = await bestsellersService.listBestsellers();
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}
