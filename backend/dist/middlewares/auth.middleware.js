"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = require("../utils/http.error");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const authenticate = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new http_error_1.HttpError(401, "Access token required"));
        }
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
            if (typeof decoded === "object" &&
                decoded !== null &&
                "userId" in decoded &&
                "role" in decoded &&
                typeof decoded.userId === "string" &&
                typeof decoded.role === "string") {
                req.user = {
                    userId: decoded.userId,
                    role: decoded.role,
                };
                if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                    return next(new http_error_1.HttpError(403, "Access denied: insufficient role"));
                }
                return next();
            }
            return next(new http_error_1.HttpError(403, "Invalid token payload"));
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return next(new http_error_1.HttpError(401, "Access token expired"));
            }
            return next(new http_error_1.HttpError(403, "Invalid access token"));
        }
    };
};
exports.authenticate = authenticate;
