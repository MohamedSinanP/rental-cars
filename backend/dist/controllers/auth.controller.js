"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_js_1 = __importDefault(require("../di/types.js"));
const types_js_2 = require("../types/types.js");
const http_response_js_1 = require("../utils/http.response.js");
const http_error_js_1 = require("../utils/http.error.js");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    ;
    async signupUser(req, res, next) {
        try {
            const { userName, email, password, role } = req.body;
            const user = await this.authService.signupConsumer(userName, email, password, role);
            res.status(types_js_2.StatusCode.CREATED).json(http_response_js_1.HttpResponse.success(user));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async signupOwner(req, res, next) {
        try {
            const { userName, email, password, role, commision } = req.body;
            const owner = await this.authService.signupOwner(userName, email, password, role, commision);
            res.status(types_js_2.StatusCode.CREATED).json(http_response_js_1.HttpResponse.success(owner, "OTP sended successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.adminLogin(email, password, res);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(user, "You are logged in successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userDetails = await this.authService.login(email, password, res);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({ userDetails }, "You are logged in successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async handleGoogleCallback(req, res, next) {
        try {
            const profile = req.user;
            const { accessToken, refreshToken, user } = await this.authService.googleAuth(profile);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.redirect(`${process.env.CLIENT_URL}/auth/google?token=${accessToken}`);
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async verifyOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            const token = await this.authService.verifyOtp(email, otp, res);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({ token: token.accessToken }, "OTP verified successfully"));
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async resendOtp(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Email is required");
            }
            ;
            await this.authService.resendOtp(email);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({}, "New OTP sended successfully."));
        }
        catch (error) {
            next(error);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const { email } = req.body;
            await this.authService.verifyEmail(email);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({}, "reset passwrod link send to your email "));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async verifyResetOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            await this.authService.resetPassword(email, otp);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({}, "OTP verified successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async resetPwd(req, res, next) {
        try {
            const { token, newPwd } = req.body;
            await this.authService.resetPassword(token, newPwd);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({}, "Password changed successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async refreshToken(req, res, next) {
        try {
            const { newAccessToken, newRefreshToken } = await this.authService.rotateRefreshToken(req.cookies.refreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({ newAccessToken }));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async logout(req, res, next) {
        try {
            await this.authService.logout(req, res);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({}, "Logget out successfully"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getCurrentUser(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            const currentUser = await this.authService.getCurrentUser(userId);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(currentUser));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IAuthService)),
    __metadata("design:paramtypes", [Object])
], AuthController);
exports.default = AuthController;
;
//# sourceMappingURL=auth.controller.js.map