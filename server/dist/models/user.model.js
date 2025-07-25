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
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const HttpStatus_1 = require("../utils/HttpStatus");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const assertValidJWTExpiry = (value) => {
    if (!/^\d+[smhd]$/.test(value)) {
        throw new Error("Invalid JWT expiry format");
    }
    return value;
};
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
}, {
    timestamps: true,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error("Password hashing failed");
            next(err);
        }
    });
});
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, this.get("password"));
    });
};
userSchema.methods.generateAuthTokens = function () {
    const accessToken = jsonwebtoken_1.default.sign({ id: this._id }, env_1.env.ACCESS_TOKEN_SECRET, {
        expiresIn: assertValidJWTExpiry(env_1.env.ACCESS_TOKEN_EXPIRY),
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: this._id }, env_1.env.REFRESH_TOKEN_SECRET, {
        expiresIn: assertValidJWTExpiry(env_1.env.REFRESH_TOKEN_EXPIRY),
    });
    if (!refreshToken || !accessToken) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.InternalServerError, "Failed to generate authentication tokens");
    }
    return { accessToken, refreshToken };
};
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
