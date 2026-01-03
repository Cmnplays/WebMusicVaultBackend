import { Router } from "express";
const router = Router();
import { register, login, logout } from "../controllers/user.controller";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import { validate } from "../middlewares/validate.middleware";

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/logout", logout);

export default router;
