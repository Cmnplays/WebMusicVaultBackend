import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type JWTExpiryString = `${number}${"s" | "m" | "h" | "d"}`;

const assertValidJWTExpiry = (value: string): JWTExpiryString => {
  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error("Invalid JWT expiry format");
  }
  return value as JWTExpiryString;
};

interface userT extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAuthTokens(): { accessToken: string; refreshToken: string };
}

const userSchema = new Schema<userT>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Password hashing failed");
    next(err);
  }
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.get("password"));
};

userSchema.methods.generateAuthTokens = function (): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign({ id: this._id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: assertValidJWTExpiry(env.ACCESS_TOKEN_EXPIRY),
  });

  const refreshToken = jwt.sign({ id: this._id }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: assertValidJWTExpiry(env.REFRESH_TOKEN_EXPIRY),
  });
  return { accessToken, refreshToken };
};

const User = model<userT>("User", userSchema);
export default User;
