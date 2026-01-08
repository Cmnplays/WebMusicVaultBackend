import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req);
      next();
    } catch (err) {
      next(err);
    }
  };
};
