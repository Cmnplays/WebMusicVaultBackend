import { Router } from "express";
const router = Router();
import { upload } from "../middlewares/multer.middleware";

import {
  uploadSongs,
  getSongById,
  deleteSongById,
  getRandomSong,
  updateSongById,
  getSongs,
} from "../controllers/song.controller";
import { uploadSongSchema } from "../schemas/song.schema";
import { validate } from "../middlewares/validate.middleware";

//Upload song
router.post(
  "/",
  upload.array("songs", 3),
  validate(uploadSongSchema),
  uploadSongs
);
//Get songs for main page and for searching songs
router.get("/", getSongs);
//Get song by id
router.get("/:id", getSongById);
//Get random songs for shuffle play
router.get("/random", getRandomSong);

//Update song by id
router.put("/:id", updateSongById);
//Delete song by id
router.delete("/:id", deleteSongById);

//Search songs(can combine this with the get all songs also)
// router.get("/search", searchSong);

export default router;
