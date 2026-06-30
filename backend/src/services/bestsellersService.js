import Bestseller from "../models/Bestseller.js";

export async function listBestsellers() {
    return Bestseller.findAll({
        order: [["id", "ASC"]],
    });
}
