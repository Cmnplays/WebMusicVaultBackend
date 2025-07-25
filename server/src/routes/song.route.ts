import Router from "express";
import multer from "multer";
const songRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import { filesSchema } from "../schemas/song.schema";
import {
  uploadSongs,
  getAllSongs,
  getSongById,
} from "../controllers/song.controller";
import { validate } from "../middlewares/validate.middleware";
songRouter.post(
  "/songs/upload",
  upload.array("songs", 3),
  validate(filesSchema),
  uploadSongs
);
songRouter.get("/songs", getAllSongs);
songRouter.get("/songs/:id", getSongById);

export default songRouter;
