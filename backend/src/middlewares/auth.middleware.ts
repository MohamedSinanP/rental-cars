import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/http.error";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (allowedRoles: string[] = []): RequestHandler => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError(401, "Access token required"));
    }

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

        if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
          return next(new HttpError(403, "Access denied: insufficient role"));
        }

        return next();
      }

      // Invalid structure of token payload
      return next(new HttpError(403, "Invalid token payload"));

    } catch (err: any) {
      // 👇 Use 401 if token is **expired**
      if (err.name === "TokenExpiredError") {
        return next(new HttpError(401, "Access token expired"));
      }

      // 👇 Use 403 for all other errors (e.g., tampered, invalid signature)
      return next(new HttpError(403, "Invalid access token"));
    }
  };
};
