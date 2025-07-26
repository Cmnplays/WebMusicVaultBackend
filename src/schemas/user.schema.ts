import { z } from "zod";
const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );
const emailSchema = z.email("Invalid email format");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

const identifierSchema = emailSchema.or(usernameSchema);
const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});
const loginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
});

export { registerSchema, loginSchema };
