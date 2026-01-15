import { Router } from "express";
import authRouter from "./auth.route";
import songRouter from "./song.route";
import userRouter from "./user.routes";
import publicRouter from "./public.routes";
import playlistRouter from "./playlist.route";
import likeRouter from "./like.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/song", songRouter);
router.use("/user", userRouter);
router.use("/playlist", playlistRouter);
router.use("/like", likeRouter);
router.use("/public", publicRouter);
export default router;
