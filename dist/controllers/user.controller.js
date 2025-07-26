"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const HttpStatus_1 = require("../utils/HttpStatus");
const user_model_1 = __importDefault(require("../models/user.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.BadRequest, "Request body is required");
    }
    const { username, email, password } = req.body;
    const existingUser = yield user_model_1.default.findOne({
        $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.Conflict, "User already exists");
    }
    const user = yield user_model_1.default.create({
        username: username,
        email: email,
        password: password,
    });
    const { refreshToken, accessToken } = user.generateAuthTokens();
    const options = {
        secure: true,
        httpOnly: true,
    };
    res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(HttpStatus_1.HttpStatus.Created)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.Created, "User registered successfully", user));
    return;
}));
exports.register = register;
const login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.BadRequest, "Request body is required");
    }
    const { identifier, password } = req.body;
    const user = yield user_model_1.default.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");
    if (!user) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.Unauthorized, "Invalid credentials");
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.Unauthorized, "Invalid credentials");
    }
    const { refreshToken, accessToken } = user.generateAuthTokens();
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    const options = {
        secure: true,
        httpOnly: true,
    };
    res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(HttpStatus_1.HttpStatus.OK)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.OK, "User logged in successfully", userResponse));
    return;
}));
exports.login = login;
const logout = (_, res) => {
    const options = {
        secure: true,
        httpOnly: true,
    };
    res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .status(HttpStatus_1.HttpStatus.OK)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.OK, "User logged out successfully", null));
    return;
};
exports.logout = logout;
