import { Router } from "express";
import * as bestsellersController from "../controllers/bestsellersController.js";

const bestsellersRouter = Router();

bestsellersRouter.get("/", bestsellersController.getAllBestsellers);

export default bestsellersRouter;
