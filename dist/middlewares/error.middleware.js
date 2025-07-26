"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const errorMiddleware = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "BACKEND ERROR";
    let responseErrors = err.errors || [];
    if (err instanceof mongoose_1.Error.ValidationError) {
        status = 400;
        message = "Validation Error";
        responseErrors = Object.values(err.errors).map((error) => error.message);
    }
    else if (err instanceof zod_1.ZodError) {
        status = 400;
        message = "Validation Error";
        responseErrors = err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
    }
    return res.status(status).json(Object.assign(Object.assign({ status,
        message }, (env_1.env.NODE_ENV === "development" && { stack: err.stack })), { errors: responseErrors }));
};
exports.default = errorMiddleware;
