import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createPlaylist } from "../controllers/playlist.controller";
import {
  createPlaylistSchema,
  modifyPlaylistSongSchema,
} from "../schemas/playlist.schema";

const router = Router();

router
  .route("/playlist")
  .post(authMiddleware, validate(createPlaylistSchema), createPlaylist)
  .patch(authMiddleware, validate(modifyPlaylistSongSchema));

export default router;
