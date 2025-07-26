"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(status, message, errors) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors || undefined;
        if (process.env.NODE_ENV === "development") {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.default = ApiError;
