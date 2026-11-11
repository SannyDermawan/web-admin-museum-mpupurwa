import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploads.controller";
import { MAX_UPLOAD_BYTES } from "../services/blob.service";

export const uploadsRoutes = Router();

// The file is kept in memory just long enough to be checked and sent to Vercel Blob; nothing is written to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });

uploadsRoutes.post("/", upload.single("file"), uploadFile);
