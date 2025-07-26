import { Router } from "express";
const userRouter = Router();
import { register, login, logout } from "../controllers/user.controller";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import { validate } from "../middlewares/validate.middleware";
userRouter.post("/register", validate(registerSchema), register);
userRouter.post("/login", validate(loginSchema), login);
userRouter.get("/logout", logout);

export default userRouter;
