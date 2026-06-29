import HttpError from "../helpers/HttpError.js";

export default function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details.map((item) => item.message).join(", ");
            next(new HttpError(400, message));
            return;
        }

        req.body = value;
        next();
    };
}
