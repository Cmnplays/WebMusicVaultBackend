import { nanoid } from "nanoid";
import User from "../models/user.model";

export async function generateUsername(
  email: string,
  maxLength = 30
): Promise<string> {
  let username = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9._]/g, "")
    .toLowerCase();

  if (username.length > maxLength) username = username.slice(0, maxLength - 5);
  if (username.length < 3) username = username.padEnd(3, "0");
  const baseUsername = username;
  while (await User.findOne({ username })) {
    username = `${baseUsername}_${nanoid(4)}`;
  }

  return username;
}
