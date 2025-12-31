import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { HttpStatus } from "../utils/HttpStatus";
interface CustomError extends Error {
  status?: HttpStatus;
  errors?: (string | { field: string; message: string })[];
}

type NormalizedError = { field?: string; message: string };

const errorMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let status = err.status || HttpStatus.InternalServerError;
  let message = err.message || "Backend Error";
  let responseErrors: NormalizedError[];

  if (err instanceof MongooseError.ValidationError) {
    status = HttpStatus.ValidationError;
    message = "Validation Error";
    responseErrors = Object.entries(err.errors).map(([field, error]: any) => ({
      field,
      message: error.message,
    }));
  } else if (err instanceof ZodError) {
    status = HttpStatus.ValidationError;
    message = "Validation Error";

    responseErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (Array.isArray(err.errors) && err.errors.length > 0) {
    responseErrors = err.errors.map((e) =>
      typeof e === "string" ? { message: e } : e
    );
  } else {
    responseErrors = [{ message: err.message }];
  }

  res.status(status).json({
    status,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
    errors: responseErrors,
  });
};

export default errorMiddleware;
