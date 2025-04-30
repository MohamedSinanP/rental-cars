"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inversify_1 = require("inversify");
let JwtService = class JwtService {
    accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    generateAccessToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, this.accessTokenSecret, { expiresIn: "15m" });
    }
    generateRefreshToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, this.refreshTokenSecret, { expiresIn: "7d" });
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            throw new Error("Invalid access token");
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, inversify_1.injectable)()
], JwtService);
//# sourceMappingURL=jwt.js.map