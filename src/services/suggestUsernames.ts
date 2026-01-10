import { customAlphabet } from "nanoid";
export const getUsernameSuggestions = ({
  n,
  identifier,
  maxLength = 30,
}: {
  n: number;
  identifier: string;
  maxLength?: number;
}) => {
  if (identifier.includes("@")) {
    identifier = identifier.split("@")[0].toLowerCase();
  }
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  if (identifier.length > maxLength - 6)
    identifier = identifier.slice(0, maxLength - 6);
  if (identifier.length < 3) identifier = identifier.padEnd(3, "0");

  const baseUsername = identifier;
  let usernameSuggestions: string[] = [];
  while (n !== 0) {
    identifier = `${baseUsername}_${nanoid()}`;
    usernameSuggestions.push(identifier);
    n--;
  }
  return usernameSuggestions;
};
