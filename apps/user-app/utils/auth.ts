import jwt from "jsonwebtoken";

export const genrateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "";
  const token = jwt.sign(userId, secret, { expiresIn: "15d" });
  return token;
};
