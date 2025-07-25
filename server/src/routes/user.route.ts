import { Router } from "express";
const userRouter = Router();
import { register, login } from "../controllers/user.controller";

userRouter.post("/register", register);
userRouter.post("/login", login);

export default userRouter;
