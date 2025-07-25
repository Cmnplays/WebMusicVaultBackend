import { Router } from "express";
const userRouter = Router();
import { register, login, logout } from "../controllers/user.controller";

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);

export default userRouter;
