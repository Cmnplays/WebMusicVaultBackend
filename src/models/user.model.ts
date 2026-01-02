import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/auth.services";

interface User extends Document<Types.ObjectId> {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isEmailVerified?: boolean;
  refreshToken: String | undefined;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAuthTokens(): { accessToken: string; refreshToken: string };
}
const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be greater than 2 characters"],
      maxlength: [15, "Username must be at most 15 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [5, "Email must be greater than 4 characters"],
      maxlength: [50, "Email must be at most 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      //no regex, minlen, and maxlen for simplicity while testing
      // minlength: [8, "Password must be at least 8 characters"],
      // maxlength: [128, "Password must be at most 128 characters"],
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
    refreshToken: {
      type: String,
      default: undefined,
    },
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
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthTokens = function (this: User): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken({ _id: this._id.toString() }),
    refreshToken: generateRefreshToken({
      _id: this._id.toString(),
    }),
  };
};

const User = model<User>("User", userSchema);
export default User;
