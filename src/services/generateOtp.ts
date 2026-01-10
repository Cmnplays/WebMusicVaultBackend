import crypto from "crypto";
export const generateOtp = (): string => {
  const min = 100000;
  const max = 999999;
  const otp = crypto.randomInt(min, max + 1).toString();
  return otp;
};
