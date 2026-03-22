import jwt from "jsonwebtoken";

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  const token = jwt.sign({ userId }, secret, { expiresIn: "15d" });
  return token;
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret_key";
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

