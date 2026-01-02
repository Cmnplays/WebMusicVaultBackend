import jwt from "jsonwebtoken";
import { HttpStatus } from "../utils/HttpStatus";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";
import type { StringValue } from "ms";
const accessTokenExpiry = env.ACCESS_TOKEN_EXPIRY as StringValue;
const refreshTokenExpiry = env.REFRESH_TOKEN_EXPIRY as StringValue;

interface TokenPayload {
  _id: string;
}

const generateAccessToken = (payload: TokenPayload): string => {
  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiry,
  });

  if (!accessToken) {
    throw new ApiError(
      HttpStatus.InternalServerError,
      "Failed to generate access token"
    );
  }
  return accessToken;
};

const generateRefreshToken = (payload: TokenPayload): string => {
  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiry,
  });
  if (!refreshToken) {
    throw new ApiError(
      HttpStatus.InternalServerError,
      "Failed to generate refresh token"
    );
  }
  return refreshToken;
};

export { generateRefreshToken, generateAccessToken };
