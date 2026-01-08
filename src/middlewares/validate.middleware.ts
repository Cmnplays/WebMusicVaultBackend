// middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // schema.parse(req.body); while developing the version 2 (reviewing and updating  branch name of now (08,01,2026)) i noticed that i was just doing schema.parse i was not reassigning the parsed value to the req.body back

      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          status: 400,
          message: "Validation Error",
          errors: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
};
