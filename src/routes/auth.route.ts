import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  oauthLogin,
  requestOtp,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller";
import { registerSchema, localLoginSchema } from "../schemas/user.schema";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";
const router = Router();

//Register
router.post("/", validate(registerSchema), register);

//Login
router.post("/login", validate(localLoginSchema), login);

//Oauth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  oauthLogin
);

//Email verification
router.get("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.get("/resend-otp", resendOtp);

//Refresh token
router.get("/refresh-token", authMiddleware, refreshAccessToken);

//logout
router.get("/logout", authMiddleware, logout);

export default router;
