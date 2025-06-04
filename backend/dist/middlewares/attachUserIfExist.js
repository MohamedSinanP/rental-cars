"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserIfExists = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const attachUserIfExists = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }
    ;
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
        }
    }
    catch (err) {
    }
    next();
};
exports.attachUserIfExists = attachUserIfExists;
