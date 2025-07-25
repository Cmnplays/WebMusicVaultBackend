"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const usernameSchema = zod_1.z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
const emailSchema = zod_1.z.email("Invalid email format");
const passwordSchema = zod_1.z
    .string()
    .min(6, "Password must be at least 6 characters long");
const identifierSchema = emailSchema.or(usernameSchema);
const registerSchema = zod_1.z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});
exports.registerSchema = registerSchema;
const loginSchema = zod_1.z.object({
    identifier: identifierSchema,
    password: passwordSchema,
});
exports.loginSchema = loginSchema;
