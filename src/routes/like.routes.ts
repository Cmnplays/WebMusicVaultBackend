import { Router } from "express";
import { likeSong } from "../controllers/like.controller";
import { validate } from "../middlewares/validate.middleware";
import { likeSongSchema } from "../schemas/like.schema";

const router = Router();

router.post("/like/:songid", validate(likeSongSchema), likeSong);

export default router;
