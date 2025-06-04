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
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const types_2 = require("../types/types");
const mail_1 = require("../utils/mail");
const http_error_1 = require("../utils/http.error");
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESEND_OTP_COOLDOWN = 60 * 1000;
let AuthService = class AuthService {
    constructor(_userRepository, _ownerRepository, _adminRepository, _otpService, _jwtService) {
        this._userRepository = _userRepository;
        this._ownerRepository = _ownerRepository;
        this._adminRepository = _adminRepository;
        this._otpService = _otpService;
        this._jwtService = _jwtService;
    }
    ;
    signupConsumer(userName, email, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = (yield this._userRepository.findByEmail(email)) ||
                (yield this._ownerRepository.findByEmail(email));
            if (existingUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.CONFLICT, "The user with this email already exists");
            }
            ;
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const otp = yield (0, mail_1.generateOtp)();
            const otpExpiresAt = new Date(Date.now() + 60 * 1000);
            const otpLastSentAt = new Date();
            console.log(otp, "cosumer");
            const user = yield this._userRepository.register({
                userName,
                email,
                password: hashedPwd,
                role,
                otp,
                otpExpiresAt,
                otpLastSentAt,
                refreshToken: null,
                isBlocked: false,
                isVerified: false
            });
            if (user) {
                this._otpService.sendEmail(user.email, otp, "emailVerification");
            }
            ;
            return {
                id: user._id.toString(),
                userName: user.userName,
                email: user.email,
                isBlocked: user.isBlocked,
                role: user.role,
                isVerified: user.isVerified,
            };
        });
    }
    ;
    signupOwner(userName, email, password, role, commision) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = (yield this._ownerRepository.findByEmail(email)) ||
                (yield this._userRepository.findByEmail(email));
            if (existingUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.CONFLICT, "The user with this email already exists");
            }
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const otp = yield (0, mail_1.generateOtp)();
            console.log('this is the owner otp', otp);
            const otpExpiresAt = new Date(Date.now() + 60 * 1000);
            const otpLastSentAt = new Date();
            const owner = yield this._ownerRepository.register({
                userName,
                email,
                password: hashedPwd,
                role,
                commission: commision,
                otp,
                otpExpiresAt,
                otpLastSentAt,
                refreshToken: null,
                isBlocked: false,
                isVerified: false
            });
            if (owner) {
                this._otpService.sendEmail(owner.email, otp, "emailVerification");
            }
            ;
            return {
                id: owner._id.toString(),
                userName: owner.userName,
                email: owner.email,
                isBlocked: owner.isBlocked,
                role: owner.role,
                isVerified: owner.isVerified,
            };
        });
    }
    ;
    adminLogin(email, password, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._adminRepository.findByEmail(email);
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Invalid email or password");
            }
            ;
            const isPasswordValid = password === user.password;
            if (!isPasswordValid) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Password is incorrect");
            }
            ;
            const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
            const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
            yield this._adminRepository.update(String(user._id), { refreshToken: refreshToken });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return {
                accessToken,
                email: user.email,
                role: user.role
            };
        });
    }
    ;
    login(email, password, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRepository.findByEmail(email);
            if (!user) {
                user = yield this._ownerRepository.findByEmail(email);
            }
            ;
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Invalid email or password");
            }
            ;
            const isPasswordValid = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isPasswordValid) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Invalid email or password");
            }
            ;
            if (user.isBlocked) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Your account has been blocked");
            }
            ;
            if (!user.isVerified) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Please verify your email before logging in");
            }
            ;
            const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
            const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
            if (user.role === types_2.Role.USER) {
                yield this._userRepository.update(String(user._id), { refreshToken: refreshToken });
            }
            else {
                yield this._ownerRepository.update(String(user._id), { refreshToken: refreshToken });
            }
            ;
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return {
                accessToken,
                user: {
                    userName: user.userName,
                    email: user.email,
                    isBlocked: user.isBlocked,
                    role: user.role,
                    isVerified: user.isVerified,
                }
            };
        });
    }
    ;
    googleAuth(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!profile.emails || !((_a = profile.emails[0]) === null || _a === void 0 ? void 0 : _a.value)) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Email not available from Google profile");
            }
            const email = profile.emails[0].value;
            let user = yield this._userRepository.findByEmail(email);
            if (!user) {
                user = yield this._userRepository.register({
                    userName: profile.displayName,
                    email,
                    googleId: profile.id,
                    role: types_2.Role.USER,
                    isBlocked: false,
                    isVerified: true,
                });
            }
            if (user.isBlocked) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Your account is blocked.");
            }
            const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
            const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
            yield this._userRepository.update(String(user._id), { refreshToken });
            return {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id.toString(),
                    userName: user.userName,
                    email: user.email,
                    role: user.role,
                    isBlocked: user.isBlocked,
                    isVerified: user.isVerified,
                }
            };
        });
    }
    verifyOtp(email, otp, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRepository.findByEmail(email);
            if (!user) {
                user = yield this._ownerRepository.findByEmail(email);
            }
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "User not found");
            }
            ;
            if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "OTP has expired. Please request once again");
            }
            ;
            if (user.otp !== otp) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Invlid OTP. Please try again");
            }
            ;
            const accessToken = this._jwtService.generateAccessToken(String(user._id), user.role);
            const refreshToken = this._jwtService.generateRefreshToken(String(user._id), user.role);
            let updatedUser;
            if (user.role === types_2.Role.USER) {
                updatedUser = yield this._userRepository.update(user._id.toString(), { refreshToken, isVerified: true });
            }
            else {
                updatedUser = yield this._ownerRepository.update(user._id.toString(), { refreshToken, isVerified: true });
            }
            if (!updatedUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Email verification failed.");
            }
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return {
                accessToken,
                user: {
                    userName: updatedUser.userName,
                    email: updatedUser.email,
                    isBlocked: updatedUser.isBlocked,
                    role: updatedUser.role,
                    isVerified: updatedUser.isVerified,
                }
            };
        });
    }
    ;
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRepository.findByEmail(email);
            if (!user) {
                user = yield this._ownerRepository.findByEmail(email);
            }
            ;
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "User not found");
            }
            ;
            if (user.isVerified) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User is already verified");
            }
            ;
            const now = Date.now();
            if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < RESEND_OTP_COOLDOWN) {
                const remainingTime = Math.ceil((RESEND_OTP_COOLDOWN - (now - user.otpLastSentAt.getTime())) / 1000);
                throw new http_error_1.HttpError(429, `Please wait ${remainingTime} seconds before requesting a new OTP`);
            }
            ;
            const otp = yield (0, mail_1.generateOtp)();
            const otpExpiresAt = new Date(Date.now() + 60 * 1000);
            const otpLastSentAt = new Date();
            console.log("this is your otp", otp);
            if (user.role === types_2.Role.USER) {
                yield this._userRepository.update(String(user._id), {
                    otp,
                    otpExpiresAt,
                    otpLastSentAt
                });
            }
            else {
                yield this._ownerRepository.update(String(user._id), {
                    otp,
                    otpExpiresAt,
                    otpLastSentAt
                });
            }
            ;
            yield this._otpService.sendEmail(user.email, otp, "emailVerification");
        });
    }
    ;
    verifyEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (email === "") {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Invalid email");
            }
            ;
            let user = yield this._userRepository.findByEmail(email);
            if (!user) {
                user = yield this._ownerRepository.findByEmail(email);
            }
            ;
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "User not found");
            }
            ;
            if (user.googleId) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "This account was created using Google. You can't reset the password.");
            }
            const resetToken = crypto_1.default.randomBytes(32).toString("hex");
            const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000);
            if (user.role === types_2.Role.USER) {
                yield this._userRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
            }
            else {
                yield this._ownerRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
            }
            ;
            this._otpService.sendEmail(email, resetToken, "passwordReset");
        });
    }
    ;
    resetPassword(token, newPwd) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this._userRepository.findOne({ resetToken: token });
            let isOwner = false;
            if (!user) {
                user = yield this._ownerRepository.findOne({ resetToken: token });
                isOwner = true;
            }
            if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Invalid or expired token");
            }
            const hashedPwd = yield bcrypt_1.default.hash(newPwd, 10);
            const updateData = {
                password: hashedPwd,
                resetToken: null,
                resetTokenExpiresAt: null,
            };
            if (isOwner) {
                yield this._ownerRepository.update(String(user._id), updateData);
            }
            else {
                yield this._userRepository.update(String(user._id), updateData);
            }
        });
    }
    rotateRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken)
                throw new http_error_1.HttpError(401, "No refresh token provided");
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
            }
            catch (err) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
            }
            if (!decoded ||
                typeof decoded !== "object" ||
                !("userId" in decoded) ||
                typeof decoded.userId !== "string") {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
            }
            const payload = decoded;
            let user;
            if (payload.role === types_2.Role.USER) {
                user = yield this._userRepository.findById(payload.userId);
            }
            else if (payload.role === types_2.Role.OWNER) {
                user = yield this._ownerRepository.findById(payload.userId);
            }
            else if (payload.role === types_2.Role.ADMIN) {
                user = yield this._adminRepository.findById(payload.userId);
            }
            if (!user || user.refreshToken !== refreshToken) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Invalid or expired refresh token");
            }
            const { _id, role } = user;
            const newAccessToken = this._jwtService.generateAccessToken(String(_id), role);
            const newRefreshToken = this._jwtService.generateRefreshToken(String(_id), role);
            if (role === types_2.Role.USER) {
                yield this._userRepository.update(String(_id), { refreshToken: newRefreshToken });
            }
            else if (role === types_2.Role.OWNER) {
                yield this._ownerRepository.update(String(_id), { refreshToken: newRefreshToken });
            }
            else if (role === types_2.Role.ADMIN) {
                yield this._adminRepository.update(String(_id), { refreshToken: newRefreshToken });
            }
            return {
                newAccessToken,
                newRefreshToken
            };
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req;
            const userId = user === null || user === void 0 ? void 0 : user.userId;
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                throw new http_error_1.HttpError(204, "No token to logout");
            let updatedUser = null;
            updatedUser = yield this._userRepository.update(userId, { refreshToken: null });
            if (!updatedUser) {
                updatedUser = yield this._ownerRepository.update(userId, { refreshToken: null });
            }
            if (!updatedUser) {
                updatedUser = yield this._adminRepository.update(userId, { refreshToken: null });
            }
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
            });
        });
    }
    ;
};
AuthService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IOwnerRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.IAdminRepository)),
    __param(3, (0, inversify_1.inject)(types_1.default.IOtpService)),
    __param(4, (0, inversify_1.inject)(types_1.default.IJwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AuthService);
exports.default = AuthService;
;
