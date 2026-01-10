import { Resend } from "resend";
import { env } from "../config/env";
import type { CreateEmailResponse } from "resend";
const resend = new Resend(env.RESEND_EMAIL_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<CreateEmailResponse> => {
  try {
    const response = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("Email sending failed");
  }
};

export const generateOtpEmail = (otp: string) => {
  const subject = "Your WebMusicVault OTP Code";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #6c63ff;">WebMusicVault</h2>
      <p>Hi there,</p>
      <p>Your one-time password (OTP) for logging into <strong>WebMusicVault</strong> is:</p>
      <h1 style="color: #6c63ff;">${otp}</h1>
      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      <hr />
      <p style="font-size: 0.9rem; color: #888;">
        If you didn’t request this, please ignore this email.
      </p>
    </div>
  `;

  return { subject, html };
};
