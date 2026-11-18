import { Router } from "express";
import {
  getCollectionDetail,
  getCollections,
  patchCollection,
  postCollection,
  removeCollection,
} from "../controllers/collections.controller";

export const collectionsRoutes = Router();

collectionsRoutes.get("/", getCollections);
collectionsRoutes.get("/:id", getCollectionDetail);
collectionsRoutes.post("/", postCollection);
collectionsRoutes.patch("/:id", patchCollection);
collectionsRoutes.delete("/:id", removeCollection);