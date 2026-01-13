import crypto from "crypto";
import User from "../models/user.model";
import { HttpStatus } from "../utils/HttpStatus";
import ApiError from "../utils/ApiError";
import { generateOtpEmail } from "./email.services";
import { sendEmail } from "./email.services";
const generateOtp = (): string => {
  const min = 100000;
  const max = 999999;
  const otp = crypto.randomInt(min, max + 1).toString();
  return otp;
};

type sendOtp = {
  email: string;
  purpose: "verify-email" | "set-password";
};

const sendOtpService = async ({ email, purpose }: sendOtp): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(
      HttpStatus.NotFound,
      `User with email ${email} is not registered`
    );
  }
  if (purpose === "set-password" && user.password) {
    throw new ApiError(HttpStatus.Conflict, "Password already set");
  }
  if (purpose === "verify-email" && user.isEmailVerified) {
    throw new ApiError(HttpStatus.Conflict, "Email already verified");
  }
  if (user.otpExpiry && user.otpExpiry.getTime() - 9 * 60 * 1000 > Date.now()) {
    throw new ApiError(
      HttpStatus.TooManyRequests,
      "Please wait one minute before resending Otp"
    );
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  const { subject, html } = generateOtpEmail(otp);
  const { error } = await sendEmail({ to: email, subject, html });
  if (error) {
    throw new ApiError(error.statusCode as number, error.message);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`OTP for ${email}: ${otp}`);
  }
};

export { sendOtpService };
