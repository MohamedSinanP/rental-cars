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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const types_2 = require("../types/types");
const http_response_1 = require("../utils/http.response");
const http_error_1 = require("../utils/http.error");
let AuthController = class AuthController {
    constructor(_authService) {
        this._authService = _authService;
    }
    ;
    signupUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userName, email, password, role } = req.body;
                const user = yield this._authService.signupConsumer(userName, email, password, role);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.success(user));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    signupOwner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userName, email, password, role, commision } = req.body;
                const owner = yield this._authService.signupOwner(userName, email, password, role, commision);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.success(owner, "OTP sended successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    adminLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield this._authService.adminLogin(email, password, res);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(user, "You are logged in successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const userDetails = yield this._authService.login(email, password, res);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({ userDetails }, "You are logged in successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    handleGoogleCallback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profile = req.user;
                const { accessToken, refreshToken, user } = yield this._authService.googleAuth(profile);
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
        });
    }
    ;
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const userDetails = yield this._authService.verifyOtp(email, otp, res);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({ userDetails }, "OTP verified successfully"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    resendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Email is required");
                }
                ;
                yield this._authService.resendOtp(email);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "New OTP sended successfully."));
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this._authService.verifyEmail(email);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "reset passwrod link send to your email "));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    verifyResetOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                yield this._authService.resetPassword(email, otp);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "OTP verified successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    resetPwd(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPwd } = req.body;
                yield this._authService.resetPassword(token, newPwd);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "Password changed successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { newAccessToken, newRefreshToken } = yield this._authService.rotateRefreshToken(req.cookies.refreshToken);
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({ newAccessToken }));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._authService.logout(req, res);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "Logget out successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
};
AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IAuthService)),
    __metadata("design:paramtypes", [Object])
], AuthController);
exports.default = AuthController;
;
