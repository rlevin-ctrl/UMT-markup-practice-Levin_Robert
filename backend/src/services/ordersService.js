import Bouquet from "../models/Bouquet.js";
import Order from "../models/Order.js";
import HttpError from "../helpers/HttpError.js";

export async function createOrder(payload) {
    if (payload.bouquetId) {
        const bouquet = await Bouquet.findByPk(payload.bouquetId);
        if (!bouquet) {
            throw new HttpError(404, "Bouquet not found");
        }
    }

    return Order.create({
        customerName: payload.customerName,
        phone: payload.phone,
        address: payload.address || null,
        message: payload.message || null,
        productTitle: payload.productTitle,
        productPrice: payload.productPrice,
        quantity: payload.quantity ?? 1,
        bouquetId: payload.bouquetId ?? null,
    });
}
