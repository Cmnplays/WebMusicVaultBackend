import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";
import { sendEmail, generateOtpEmail } from "../services/email.services";
import { generateOtp } from "../services/generateOtp";
import { getUsernameSuggestions } from "../services/suggestUsernames";
import jwt, { JwtPayload } from "jsonwebtoken";

const options: import("express").CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "none",
};

const oauthLogin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;

    if (!user) {
      throw new ApiError(500, "User not found after OAuth login");
    }

    const { accessToken, refreshToken } = await user.generateAuthTokens();
    res
      .status(HttpStatus.OK)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(HttpStatus.OK, "Successfully logged in", {
          user,
          accessToken,
        })
      );
  }
);

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, displayName, username } = req.body;
    // const existingUser: User | null = await User.findOne({
    //   $or: [{ username }, { email }],
    // });
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      throw new ApiError(
        HttpStatus.Conflict,
        `User with email ${email} is already registered`
      );
    }

    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      throw new ApiError(
        HttpStatus.Conflict,
        `Username ${username} is already taken`
      );
    }

    // if (existingUser) {
    //   throw new ApiError(
    //     HttpStatus.Conflict,
    //     `User with email ${email} is already registered`
    //   );
    // }
    const user: User = await User.create({
      email,
      username,
      displayName,
      password,
    });

    if (!user) {
      throw new ApiError(
        HttpStatus.InternalServerError,
        "Error while registering user"
      );
    }
    //*Method-1
    // const createdUser: User | null = await User.findById(user._id)
    //   .select("-password -refreshToken")
    //   .lean();
    // better approach
    //*Method-2
    // const createdUser = user.toObject();
    // delete createdUser.password;
    // delete createdUser.refreshToken;
    //*Method-3 -> Automated removal of these two fields inside the schema of user itself

    const { accessToken, refreshToken } = await user.generateAuthTokens();

    res
      .status(HttpStatus.Created)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(HttpStatus.Created, "Successfully logged in", {
          user,
          accessToken,
        })
      );
  }
);

const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { identifier, password } = req.body;
    const user: User | null = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    console.log(identifier, password);

    if (!user) {
      throw new ApiError(
        HttpStatus.Unauthorized,
        "Invalid email/username or password"
      );
    }

    if (!user.authProviders!.includes("local") && user.password == undefined) {
      throw new ApiError(
        HttpStatus.Forbidden,
        `This account was registered with google. Please log in using google or set a password to enable password login.`
      );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(
        HttpStatus.Unauthorized,
        "Invalid email/username or password"
      );
    }
    const { accessToken, refreshToken } = await user.generateAuthTokens();
    res
      .status(HttpStatus.OK)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(HttpStatus.OK, "Successfully logged in", {
          user,
          accessToken,
        })
      );
  }
);

const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    if (!user.refreshToken) {
      throw new ApiError(HttpStatus.BadRequest, "User is not logged in");
    }
    user.refreshToken = undefined;
    await user.save();
    res
      .clearCookie("refreshToken", options)
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(HttpStatus.OK, "User logged out successfully", null)
      );
  }
);

const suggestUsername = (req: Request, res: Response): void => {
  const data: { identifier: string; n: number } = req.body;
  const usernames = getUsernameSuggestions(data);
  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        "Successfully sent list of suggested usernames",
        usernames
      )
    );
};

//route for people who signed up with the oauth and now they are trying to login with normal local auth.So, they are asked to give otp send to their email and then set the password for their  id.
const setPassword = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password, otp } = req.body;
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) {
    throw new ApiError(
      HttpStatus.NotFound,
      `User ${identifier} is not registered`
    );
  }
  if (user.password) {
    throw new ApiError(HttpStatus.Conflict, "Password already set");
  }
  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(
      HttpStatus.BadRequest,
      "No OTP found. Please request a new one."
    );
  }
  if (user.otpExpiry < new Date()) {
    throw new ApiError(HttpStatus.BadRequest, "OTP expired.Please Try again.");
  }
  if (user.otp !== otp) {
    throw new ApiError(HttpStatus.BadRequest, "Invalid Otp. Please Try again.");
  }
  user.password = password;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.authProviders?.push("local");
  await user.save();
  const { refreshToken, accessToken } = await user.generateAuthTokens();

  res.status(HttpStatus.OK).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(HttpStatus.OK, "Successfully set password", {
      user,
      accessToken,
    })
  );
});

//Otp Controllers
const requestOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const { purpose } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(
        HttpStatus.NotFound,
        `User with email ${email} is not registered`
      );
    }
    if (user.otpExpiry && user.otpExpiry > new Date()) {
      throw new ApiError(
        HttpStatus.TooManyRequests,
        "OTP already sent. Try again later."
      );
    }
    if (purpose === "set-password" && user.password) {
      throw new ApiError(HttpStatus.Conflict, "Password already set");
    }
    if (purpose === "verify-email" && user.isEmailVerified) {
      throw new ApiError(HttpStatus.Conflict, "Email already verified");
    }
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
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
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          "Successfully send the otp to your email",
          null
        )
      );
  }
);
const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(
        HttpStatus.NotFound,
        `User with email ${email} is not registered`
      );
    }
    if (!user.otp || !user.otpExpiry) {
      throw new ApiError(
        HttpStatus.BadRequest,
        "No OTP found. Please request a new one."
      );
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      throw new ApiError(
        HttpStatus.BadRequest,
        "OTP expired.Please Try again."
      );
    }
    if (user.otp !== otp) {
      throw new ApiError(
        HttpStatus.BadRequest,
        "Invalid Otp. Please Try again."
      );
    }
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(HttpStatus.OK, "Successfully verified email", null)
      );
  }
);
const resendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const { purpose } = req.query;
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
    if (user.otpExpiry && user.otpExpiry > new Date(Date.now() - 60 * 1000)) {
      throw new ApiError(
        HttpStatus.TooManyRequests,
        "Please wait one minute before resending Otp"
      );
    }
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
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
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          "Successfully send the otp to your email",
          null
        )
      );
  }
);

const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(HttpStatus.Unauthorized, "Refresh token is required");
    }
    const decoded = jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET
    ) as JwtPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(HttpStatus.Unauthorized, "Invalid token");
    }
    if (user.refreshToken !== refreshToken) {
      throw new ApiError(HttpStatus.Unauthorized, "Token has been revoked");
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await user.generateAuthTokens();

    res
      .status(HttpStatus.OK)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ accessToken });
  }
);

export {
  register,
  suggestUsername,
  setPassword,
  login,
  logout,
  refreshAccessToken,
  oauthLogin,
  requestOtp,
  verifyEmail,
  resendOtp,
};
