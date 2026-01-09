import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/auth.services";
import avatars from "../config/avatars";

interface User extends Document<Types.ObjectId> {
  username: string;
  email: string;
  displayName: string;
  password?: string;
  avatar: string;
  googleId?: string;
  isEmailVerified?: boolean;
  otp: string;
  otpExpiry: Date;
  authProvider: "local" | "google";
  role: "user" | "admin";
  refreshToken: String | undefined;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAuthTokens(): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be greater than 2 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
    },
    displayName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      minlength: [5, "Email must be greater than 4 characters"],
      maxlength: [50, "Email must be at most 50 characters"],
    },
    password: {
      type: String,
      required: false, //because we are going to use both oauth login method and normal username/email + password login method
      select: false,
      //no regex, minlen, and maxlen for simplicity while testing
      // minlength: [8, "Password must be at least 8 characters"],
      // maxlength: [128, "Password must be at most 128 characters"],
    },
    avatar: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, //sparse only check uniqueness when googleid is not null or undefined
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.index({ email: 1, authProvider: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (this.authProvider !== "local") {
    return next();
  }
  if (!this.password)
    return next(new Error("Password is required for local login"));

  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Password hashing failed");
    next(err);
  }
  if (!this.avatar) {
    const randomAvatar = Math.floor(Math.random() * avatars.length);
    this.avatar = avatars[randomAvatar];
  }
  next();
});
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAuthTokens = async function (this: User): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = generateAccessToken({ _id: this._id.toString() });
  const refreshToken = generateRefreshToken({
    _id: this._id.toString(),
  });
  this.refreshToken = refreshToken;
  await this.save();
  return {
    accessToken,
    refreshToken,
  };
};
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = model<User>("User", userSchema);
export default User;
