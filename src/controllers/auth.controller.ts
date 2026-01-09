import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";
import { GenerateUsername } from "../utils/GenerateUsername";

const oauthLogin = async (req: Request, res: Response) => {
  const user = req.user as User;

  if (!user) {
    return res
      .status(500)
      .json(new ApiError(500, "User not found after OAuth login"));
  }

  const { accessToken, refreshToken } = await user.generateAuthTokens();
  const options: import("express").CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  };
  res.status(HttpStatus.OK).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(HttpStatus.OK, "Successfully logged in", {
      user,
      accessToken,
    })
  );
};

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { identifier, password } = req.body;
    const existingUser: User | null = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (existingUser) {
      throw new ApiError(
        HttpStatus.BadRequest,
        `User ${"@" + existingUser.username} is already registered`
      );
    }
    let user: User;

    if (identifier.includes("@")) {
      const username = GenerateUsername(identifier);
      user = await User.create({
        email: identifier,
        username,
        displayName: username,
        password,
      });
    } else {
      user = await User.create({
        username: identifier,
        displayName: identifier,
        password,
      });
    }

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

    const options: import("express").CookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
    };

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
  async (req: Request, res: Response): Promise<void> => {}
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
  return;
};

const requestOtp = asyncHandler((req: Request, res: Response) => {});
const verifyOtp = asyncHandler((req: Request, res: Response) => {});
const resendOtp = asyncHandler((req: Request, res: Response) => {});

const refreshAccessToken = async (req: Request, res: Response) => {};

export {
  register,
  login,
  logout,
  refreshAccessToken,
  oauthLogin,
  requestOtp,
  verifyOtp,
  resendOtp,
};
