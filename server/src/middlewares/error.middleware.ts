import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";

interface CustomError extends Error {
  status?: number;
  errors?: (string | { field: string; message: string })[];
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
  let responseErrors: (string | { field: string; message: string })[] =
    err.errors || [];

  if (err instanceof MongooseError.ValidationError) {
    status = 400;
    message = "Validation Error";
    responseErrors = Object.values(err.errors).map((error) => error.message);
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Validation Error";

    responseErrors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  return res.status(status).json({
    status,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
    errors: responseErrors,
  });
};

export default errorMiddleware;
