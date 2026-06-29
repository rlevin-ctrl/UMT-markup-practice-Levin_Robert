import { Router } from "express";
import validateBody from "../middleware/validateBody.js";
import { uploadPhoto } from "../middleware/uploadPhoto.js";
import {
    createBouquetSchema,
    updateBouquetSchema,
    favoriteBouquetSchema,
} from "../schemas/bouquetSchemas.js";
import * as bouquetsController from "../controllers/bouquetsController.js";

const bouquetsRouter = Router();

bouquetsRouter.get("/", bouquetsController.getAllBouquets);
bouquetsRouter.get("/:id", bouquetsController.getBouquet);
bouquetsRouter.post("/", validateBody(createBouquetSchema), bouquetsController.createBouquet);
bouquetsRouter.put("/:id", validateBody(updateBouquetSchema), bouquetsController.updateBouquet);
bouquetsRouter.delete("/:id", bouquetsController.deleteBouquet);
bouquetsRouter.patch(
    "/:id/favorite",
    validateBody(favoriteBouquetSchema),
    bouquetsController.patchFavorite,
);
bouquetsRouter.patch("/:id/photo", uploadPhoto, bouquetsController.patchPhoto);

export default bouquetsRouter;
