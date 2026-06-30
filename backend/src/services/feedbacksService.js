import Feedback from "../models/Feedback.js";

export async function listFeedbacks() {
    return Feedback.findAll({
        order: [["id", "ASC"]],
    });
}
