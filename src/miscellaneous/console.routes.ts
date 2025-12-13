import { Router } from "express";
import multer from "multer";
import {
  uploadConsoleController,
  getConsoleEntries,
} from "./console.controller";

const router = Router();

// --------------------------------------
// Multer memory storage (same as songs)
// --------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------------------------
// Fields for console uploads
// --------------------------------------
const consoleUploadFields = upload.fields([
  { name: "photos", maxCount: 5 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// --------------------------------------
// POST /api/console/upload
// Upload text/photo/audio/video
// --------------------------------------
router.post("/upload", consoleUploadFields, uploadConsoleController);

// --------------------------------------
// GET /api/console/entries
// Flexible filtering + sorting
// --------------------------------------
// ?type=photo | video | audio | text | all
// ?sort=newest | oldest
router.get("/entries", getConsoleEntries);

export default router;
