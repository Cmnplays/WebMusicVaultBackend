import { Request, Response } from "express";
import ApiResponses from "../utils/ApiResponse";
import { HttpStatus } from "../utils/HttpStatus";
const invalidRouteMiddleware = (_req: Request, res: Response): void => {
  res
    .status(HttpStatus.NotFound)
    .send(
      new ApiResponses(HttpStatus.NotFound, "This route doesn't exist", null)
    );
};

export default invalidRouteMiddleware;
