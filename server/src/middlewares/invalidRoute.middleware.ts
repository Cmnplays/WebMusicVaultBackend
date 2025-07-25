import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
const invalidRouteMiddleware = (req: Request, res: Response) => {
  throw new ApiError(HttpStatus.NotFound, "This route does not exist");
};

export default invalidRouteMiddleware;
