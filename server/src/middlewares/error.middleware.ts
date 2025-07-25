import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { Error as MongooseError } from "mongoose";

interface CustomError extends Error {
  status?: number;
  errors?: string[];
  code?: number;
}

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = err.status || 500;
  let message = err.message || "BACKEND ERROR";
  let responseErrors: string[] = err.errors || [];

  // Handle Mongoose Validation Errors
  if (err instanceof MongooseError.ValidationError) {
    status = 400;
    message = "Validation Error";
    responseErrors = Object.values(err.errors).map((error) => error.message);
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err instanceof MongooseError.CastError) {
    status = 400;
    message = "Invalid ID Format";
  }

  return res.status(status).json({
    status,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
    errors: responseErrors,
  });
};

export default errorMiddleware;
