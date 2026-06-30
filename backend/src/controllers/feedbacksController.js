import * as feedbacksService from "../services/feedbacksService.js";

export async function getAllFeedbacks(_req, res, next) {
    try {
        const items = await feedbacksService.listFeedbacks();
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}
