import * as ordersService from "../services/ordersService.js";

export async function createOrder(req, res, next) {
    try {
        const order = await ordersService.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
}
