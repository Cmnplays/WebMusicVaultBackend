import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  oauthLogin,
} from "../controllers/auth.controller";
import {
  registerSchema,
  localLoginSchema,
  oauthLoginSchema,
} from "../schemas/user.schema";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

//Register
router.post("/", validate(registerSchema), register);
//Login
router.post("/login", validate(localLoginSchema), login);
//Oauth login
router.post("/oauth-login", validate(oauthLoginSchema), oauthLogin);
//Refresh token
router.get("/refresh-token", authMiddleware, refreshAccessToken);
//logout
router.get("/logout", authMiddleware, logout);

export default router;
