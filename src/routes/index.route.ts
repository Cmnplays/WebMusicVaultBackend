import { Router } from "express";
import userRouter from "./auth.route";
import songRouter from "./song.route";
import publicRouter from "./public.routes";
import consoleRouter from "../miscellaneous/console.routes";

const router = Router();

router.use("/user", userRouter);
router.use("/song", songRouter);
router.use("/public", publicRouter);

//Miscellaneous router for experimental purposes
router.use("/console", consoleRouter);

export default router;
