import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./auth.middleware";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export const attachUserIfExists: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  };

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "role" in decoded &&
      typeof decoded.userId === "string" &&
      typeof decoded.role === "string"
    ) {
      (req as AuthenticatedRequest).user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }
  } catch (err) {
  }

  next();
};
