import Joi from "joi";

export const createOrderSchema = Joi.object({
    customerName: Joi.string().trim().min(2).max(120).required(),
    phone: Joi.string().trim().min(7).max(30).required(),
    address: Joi.string().trim().max(300).allow("").optional(),
    message: Joi.string().trim().max(2000).allow("").optional(),
    productTitle: Joi.string().trim().min(2).max(120).required(),
    productPrice: Joi.number().integer().min(1).max(100000).required(),
    quantity: Joi.number().integer().min(1).max(99).default(1),
    bouquetId: Joi.number().integer().positive().allow(null).optional(),
}).required();
