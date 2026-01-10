import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req);
      if (parsed.body) req.body = parsed.body;
      // if (parsed.query) req.query = parsed.query; this is not valid as its query is read only
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (err) {
      next(err);
    }
  };
};
