import { z } from "zod";
const username = z
  .string()
  .trim()
  .min(3, "Username must be greater than 2 characters")
  .max(15, "Username must be less than 15 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

const email = z.email("Invalid email format").trim();

const password = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(50, "Password must be less than 50 characters");

const identifier = email.or(username);

const registerSchema = z.object({
  body: z.object({
    username,
    email,
    password: password.optional(),
    authProvider: z.enum(["local", "google"]).default("local"),
  }),
});

const localLoginSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

const oauthLoginSchema = z.object({
  body: z.object({
    idToken: z.string(),
  }),
});

export { registerSchema, localLoginSchema, oauthLoginSchema };
