import { z } from "zod";
const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than or equal to 30 characters")
  .regex(
    /^[a-z0-9._]+$/,
    "Username can only contain lowercase letters, numbers, dots, and underscores"
  )
  .transform((u) => u.toLowerCase());

const email = z
  .email("Invalid email format")
  .trim()
  .transform((e) => e.toLowerCase());

const displayName = z
  .string()
  .trim()
  .min(3, "Display name must be at least 3 characters")
  .max(30, "Display name must be less than or equal to 30 letters");

const password = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(50, "Password must be less than or equal to 50 characters");

const identifier = email.or(username);

const registerSchema = z.object({
  body: z.object({
    email,
    username,
    displayName,
    password: password,
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

const suggestUsernameSchema = z.object({
  body: z.object({
    email,
  }),
});
const setPasswordSchema = z.object({
  body: z.object({
    password,
  }),
});
export {
  registerSchema,
  loginSchema,
  suggestUsernameSchema,
  setPasswordSchema,
};
