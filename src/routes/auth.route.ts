import { Router } from "express";
import {
  register,
  login,
  logout,
  suggestUsername,
  setPassword,
  refreshAccessToken,
  oauthLogin,
  requestOtp,
  verifyEmail,
  resendOtp,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  suggestUsernameSchema,
  setPasswordSchema,
  requestOtpSchema,
  resendOtpSchema,
  verifyEmailSchema,
} from "../schemas/user.schema";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";

const router = Router();

//Register
router.post("/", validate(registerSchema), register);
router.post(
  "/username-suggestions",
  validate(suggestUsernameSchema),
  suggestUsername
);
router.post("/set-password", validate(setPasswordSchema), setPassword);
//Login
router.post("/login", validate(loginSchema), login);

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
router.post("/request-otp", validate(requestOtpSchema), requestOtp);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);

//Refresh token
router.get("/refresh-token", refreshAccessToken);

//logout
router.get("/logout", authMiddleware, logout);

export default router;
