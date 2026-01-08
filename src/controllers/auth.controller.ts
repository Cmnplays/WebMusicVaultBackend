import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
      throw new ApiError(HttpStatus.Conflict, "User already exists");
    }
    const user = await User.create({
      username: username,
      email: email,
      password: password,
    });

    const { refreshToken, accessToken } = user.generateAuthTokens();

    const options = {
      secure: true,
      httpOnly: true,
    };
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(HttpStatus.Created)
      .json(
        new ApiResponse(
          HttpStatus.Created,
          "User registered successfully",
          user
        )
      );
    return;
  }
);

const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.body) {
      throw new ApiError(HttpStatus.BadRequest, "Request body is required");
    }
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");
    if (!user) {
      throw new ApiError(HttpStatus.Unauthorized, "Invalid credentials");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(HttpStatus.Unauthorized, "Invalid credentials");
    }

    const { refreshToken, accessToken } = user.generateAuthTokens();
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const options = {
      secure: true,
      httpOnly: true,
    };
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          "User logged in successfully",
          userResponse
        )
      );
    return;
  }
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
const oauthLogin = async (req: Request, res: Response) => {};

export { register, login, logout, refreshAccessToken, oauthLogin };
