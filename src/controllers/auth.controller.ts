import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { identifier, password } = req.body;
    console.log(identifier, password);
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
    .clearCookie("refreshToken", options)
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, "User logged out successfully", null));
  return;
};
const refreshAccessToken = async (req: Request, res: Response) => {};

const oauthLogin = async (req: Request, res: Response) => {
  const user = req.user as User;
  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();
  if (!createdUser) {
    return res
      .status(500)
      .json(new ApiError(500, "User not found after OAuth login"));
  }

  const { accessToken, refreshToken } = await user.generateAuthTokens();
  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  };
  console.log(createdUser);
  res
    .status(HttpStatus.Created)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(HttpStatus.Created, "Successfully logged in", {
        user: createdUser,
        accessToken,
      })
    );
};

export { register, login, logout, refreshAccessToken, oauthLogin };
