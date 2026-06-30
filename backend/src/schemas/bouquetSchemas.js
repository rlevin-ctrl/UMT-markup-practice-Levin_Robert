import Joi from "joi";

export const createBouquetSchema = Joi.object({
    title: Joi.string().trim().min(2).max(120).required(),
    description: Joi.string().trim().min(10).max(2000).required(),
    price: Joi.number().integer().min(1).max(100000).required(),
    favorite: Joi.boolean().optional(),
}).required();

export const updateBouquetSchema = Joi.object({
    title: Joi.string().trim().min(2).max(120),
    description: Joi.string().trim().min(10).max(2000),
    price: Joi.number().integer().min(1).max(100000),
    favorite: Joi.boolean(),
    photoURL: Joi.string().trim().max(500),
})
    .min(1)
    .messages({ "object.min": "At least one field is required for update" });

export const favoriteBouquetSchema = Joi.object({
    favorite: Joi.boolean().required(),
}).required();
