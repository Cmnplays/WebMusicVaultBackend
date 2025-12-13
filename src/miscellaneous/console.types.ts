import { Request } from "express";
import { ConsoleMode } from "./console.model";

// Extend Multer's File type
export interface UploadedFile extends Express.Multer.File {}

// Extend Multer's Request type safely
declare module "express-serve-static-core" {
  interface Request {
    files?:
      | {
          photos?: UploadedFile[];
          audio?: UploadedFile[];
          video?: UploadedFile[];
          [fieldname: string]: UploadedFile[] | undefined;
        }
      | UploadedFile[];
  }
}

// Body fields
export interface ConsoleUploadBody {
  mode: ConsoleMode;
  timestamp: string;
  text?: string;
}

// Combined request type
export interface ConsoleUploadRequest extends Request {
  body: ConsoleUploadBody;
}
