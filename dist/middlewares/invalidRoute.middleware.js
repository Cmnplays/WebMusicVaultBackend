"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const HttpStatus_1 = require("../utils/HttpStatus");
const invalidRouteMiddleware = (req, res) => {
    throw new ApiError_1.default(HttpStatus_1.HttpStatus.NotFound, "This route does not exist");
};
exports.default = invalidRouteMiddleware;
