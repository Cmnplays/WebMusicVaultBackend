import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import User from "../models/user.model";
import type { JwtPayload } from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.get("authorization")?.split(" ")[1];
    if (!accessToken) {
      return next(
        new ApiError(HttpStatus.Unauthorized, "Access token is required")
      );
    }
    const decoded = jwt.verify(
      accessToken,
      env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new ApiError(HttpStatus.Unauthorized, "Invalid token"));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};
