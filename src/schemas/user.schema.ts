import { z } from "zod";
const usernameSchema = z
  .string()
  .min(3, "Username must be greater than 2 characters")
  .max(15, "Username must be at most 15 characters")
  .trim()
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );
const emailSchema = z.email("Invalid email format").trim();
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(50, "Email must be at most 50 characters");

const identifierSchema = emailSchema.or(usernameSchema);
const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema.optional(),
  authProvider: z.enum(["local", "google"]).default("local"),
});
const localLoginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
});

const oauthLoginSchema = z.object({
  idToken: z.string(),
});
export { registerSchema, localLoginSchema, oauthLoginSchema };
