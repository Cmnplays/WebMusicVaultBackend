import asyncHandler from "express-async-handler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import ApiError from "../utils/ApiError";

const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const existingUser = await User.findOne({
    $or: [{ username: data.username }, { email: data.email }],
  });
  if (existingUser) {
    throw new ApiError(HttpStatus.Conflict, "User already exists");
  }
  const user = await User.create({
    username: data.username,
    email: data.email,
    password: data.password,
  });

  const { refreshToken, accessToken } = user.generateAuthTokens();
  if (!user) {
    throw new ApiError(
      HttpStatus.InternalServerError,
      "User registration failed"
    );
  }
  const options = {
    secure: true,
    httpOnly: true,
  };
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(HttpStatus.Created)
    .json(
      new ApiResponse(HttpStatus.Created, "User registered successfully", user)
    );
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({
    $or: [{ email: data.identifier }, { username: data.identifier }],
  });
  if (!user) {
    throw new ApiError(HttpStatus.Unauthorized, "Invalid credentials");
  }
  const isPasswordValid = await user.isPasswordCorrect(data.password);
  if (!isPasswordValid) {
    throw new ApiError(HttpStatus.Unauthorized, "Invalid credentials");
  }
  const options = {
    secure: true,
    httpOnly: true,
  };
  res
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, "User logged in successfully", user));
});
export { register, login };
