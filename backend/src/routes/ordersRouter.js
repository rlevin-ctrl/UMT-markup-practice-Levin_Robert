import { Router } from "express";
import validateBody from "../middleware/validateBody.js";
import { createOrderSchema } from "../schemas/orderSchemas.js";
import * as ordersController from "../controllers/ordersController.js";

const ordersRouter = Router();

ordersRouter.post("/", validateBody(createOrderSchema), ordersController.createOrder);

export default ordersRouter;
