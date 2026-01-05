import { Router } from "express";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

import {
  uploadSongs,
  getAllSongs,
  getSongById,
  deleteSongById,
  getRandomSong,
} from "../controllers/song.controller";

//Upload song
router.post("/", upload.array("songs", 3), uploadSongs);
//Get songs for main page and for searching songs
router.get("/", getAllSongs);
//Get random songs for shuffle play
router.get("/random", getRandomSong);
//Search songs(can combine this with the get all songs also)
// router.get("/search", searchSong);
//Get song by id
router.get("/:id", getSongById);
//Delete song by id
router.delete("/:id", deleteSongById);

export default router;
