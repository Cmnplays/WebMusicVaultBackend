import { Router } from "express";
import authRouter from "./auth.route";
import songRouter from "./song.route";
import userRouter from "./user.routes";
import publicRouter from "./public.routes";
import playlistRouter from "./playlist.route";
import likeRouter from "./like.routes";
import consoleRouter from "../miscellaneous/console.routes";

const router = Router();

router.use("/user", authRouter);
router.use("/song", songRouter);
router.use("/user", userRouter);
router.use("/playlist", playlistRouter);
router.use("/like", likeRouter);
router.use("/public", publicRouter);

//Miscellaneous router for experimental purposes
router.use("/console", consoleRouter);

export default router;
