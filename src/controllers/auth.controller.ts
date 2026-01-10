import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response, urlencoded } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";
import { sendEmail, generateOtpEmail } from "../services/email.services";
import { generateOtp } from "../services/generateOtp";

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

    if (!user) {
      throw new ApiError(
        HttpStatus.NotFound,
        `User ${identifier} is not registered`
      );
    }

    if (user.authProvider !== "local" && user.password == undefined) {
      throw new ApiError(
        HttpStatus.BadRequest,
        `This account was registered with ${user.authProvider}. Please log in using ${user.authProvider} or set a password to enable password login.`
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

const suggestUsername = (req: Request, res: Response) => {
  //will write this later
};

const setPassword = asyncHandler(async (req: Request, res: Response) => {});

//Otp Controllers
const requestOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
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
const verifyOtp = asyncHandler(
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
    if (!user) {
      throw new ApiError(
        HttpStatus.NotFound,
        `User with email ${email} is not registered`
      );
    }
    if (user.isEmailVerified) {
      throw new ApiError(
        HttpStatus.Conflict,
        `User with email ${email} is already verified`
      );
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
  async (req: Request, res: Response): Promise<void> => {}
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
  verifyOtp,
  resendOtp,
};
