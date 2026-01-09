import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";

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
    const options: import("express").CookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
    };
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
    const existingUser: User | null = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(
        HttpStatus.Conflict,
        `User with email ${email} is already registered`
      );
    }
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

const logout = (_: Request, res: Response): void => {
  const options = {
    secure: true,
    httpOnly: true,
  };
  res
    .clearCookie("accessToken", options)
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, "User logged out successfully", null));
};

const suggestUsername = (req: Request, res: Response) => {
  //will write this later
};

const setPassword = asyncHandler(async (req: Request, res: Response) => {});

const requestOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {}
);
const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {}
);
const resendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {}
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
