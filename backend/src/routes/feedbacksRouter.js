import { Router } from "express";
import * as feedbacksController from "../controllers/feedbacksController.js";

const feedbacksRouter = Router();

feedbacksRouter.get("/", feedbacksController.getAllFeedbacks);

export default feedbacksRouter;
