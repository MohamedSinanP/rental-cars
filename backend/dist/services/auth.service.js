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
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inversify_1 = require("inversify");
const types_js_1 = __importDefault(require("../di/types.js"));
const types_js_2 = require("../types/types.js");
const mail_js_1 = require("../utils/mail.js");
const http_error_js_1 = require("../utils/http.error.js");
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESEND_OTP_COOLDOWN = 60 * 1000;
let AuthService = class AuthService {
    _userRepository;
    _ownerRepository;
    _adminRepository;
    _otpService;
    _jwtService;
    constructor(_userRepository, _ownerRepository, _adminRepository, _otpService, _jwtService) {
        this._userRepository = _userRepository;
        this._ownerRepository = _ownerRepository;
        this._adminRepository = _adminRepository;
        this._otpService = _otpService;
        this._jwtService = _jwtService;
    }
    ;
    async signupConsumer(userName, email, password, role) {
        const existingUser = await this._userRepository.findByEmail(email);
        if (existingUser) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.CONFLICT, "The user with this email already exist");
        }
        ;
        const hashedPwd = await bcrypt_1.default.hash(password, 10);
        const otp = await (0, mail_js_1.generateOtp)();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000);
        const otpLastSentAt = new Date();
        console.log(otp, "cosumer");
        const user = await this._userRepository.register({
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
            userName: user.userName,
            email: user.email,
            password: user.password,
            isBlocked: user.isBlocked,
            role: user.role,
            isVerified: user.isVerified,
        };
    }
    ;
    async signupOwner(userName, email, password, role, commision) {
        const existingUser = await this._ownerRepository.findByEmail(email);
        if (existingUser) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.CONFLICT, "The user with this email already exist");
        }
        ;
        const hashedPwd = await bcrypt_1.default.hash(password, 10);
        const otp = await (0, mail_js_1.generateOtp)();
        console.log('this is the owner otp', otp);
        const otpExpiresAt = new Date(Date.now() + 60 * 1000);
        const otpLastSentAt = new Date();
        const owner = await this._ownerRepository.register({
            userName,
            email,
            password: hashedPwd,
            role,
            commision,
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
            userName: owner.userName,
            email: owner.email,
            password: owner.password,
            isBlocked: owner.isBlocked,
            role: owner.role,
            commision: owner.commision,
            isVerified: owner.isVerified,
        };
    }
    ;
    async adminLogin(email, password, res) {
        const user = await this._adminRepository.findByEmail(email);
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Invalid email or password");
        }
        ;
        const isPasswordValid = password === user.password;
        if (!isPasswordValid) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Password is incorrect");
        }
        ;
        const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
        const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
        await this._adminRepository.update(String(user._id), { refreshToken: refreshToken });
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
    }
    ;
    async login(email, password, res) {
        let user = await this._userRepository.findByEmail(email);
        if (!user) {
            user = await this._ownerRepository.findByEmail(email);
        }
        ;
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Invalid email or password");
        }
        ;
        const isPasswordValid = await bcrypt_1.default.compare(password, user?.password);
        if (!isPasswordValid) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Invalid email or password");
        }
        ;
        if (user.isBlocked) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.FORBIDDEN, "Your account has been blocked");
        }
        ;
        if (!user.isVerified) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.FORBIDDEN, "Please verify your email before logging in");
        }
        ;
        const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
        const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
        if (user.role === types_js_2.Role.USER) {
            await this._userRepository.update(String(user._id), { refreshToken: refreshToken });
        }
        else {
            await this._ownerRepository.update(String(user._id), { refreshToken: refreshToken });
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
    }
    ;
    async googleAuth(profile) {
        if (!profile.emails || !profile.emails[0]?.value) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Email not available from Google profile");
        }
        const email = profile.emails[0].value;
        let user = await this._userRepository.findByEmail(email);
        if (!user) {
            user = await this._userRepository.register({
                userName: profile.displayName,
                email,
                googleId: profile.id,
                role: types_js_2.Role.USER,
                isBlocked: false,
                isVerified: true,
            });
        }
        ;
        const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
        const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);
        await this._userRepository.update(String(user._id), { refreshToken: refreshToken });
        return {
            accessToken,
            refreshToken,
            user: {
                userName: user.userName,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                isVerified: user.isVerified,
            }
        };
    }
    ;
    async verifyOtp(email, otp, res) {
        let user = await this._userRepository.findByEmail(email);
        if (!user) {
            user = await this._ownerRepository.findByEmail(email);
        }
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "User not found");
        }
        ;
        if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "OTP has expired. Please request once again");
        }
        ;
        if (user.otp !== otp) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Invlid OTP. Please try again");
        }
        ;
        const accessToken = this._jwtService.generateAccessToken(String(user._id), user.role);
        const refreshToken = this._jwtService.generateRefreshToken(String(user._id), user.role);
        if (user.role === types_js_2.Role.USER) {
            await this._userRepository.findByEmailAndUpdate(user.email, refreshToken);
        }
        else {
            await this._ownerRepository.findByEmailAndUpdate(user.email, refreshToken);
        }
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return { accessToken };
    }
    ;
    async resendOtp(email) {
        let user = await this._userRepository.findByEmail(email);
        if (!user) {
            user = await this._ownerRepository.findByEmail(email);
        }
        ;
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "User not found");
        }
        ;
        if (user.isVerified) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "User is already verified");
        }
        ;
        const now = Date.now();
        if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < RESEND_OTP_COOLDOWN) {
            const remainingTime = Math.ceil((RESEND_OTP_COOLDOWN - (now - user.otpLastSentAt.getTime())) / 1000);
            throw new http_error_js_1.HttpError(429, `Please wait ${remainingTime} seconds before requesting a new OTP`);
        }
        ;
        const otp = await (0, mail_js_1.generateOtp)();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000);
        const otpLastSentAt = new Date();
        console.log("this is your otp", otp);
        if (user.role === types_js_2.Role.USER) {
            await this._userRepository.update(String(user._id), {
                otp,
                otpExpiresAt,
                otpLastSentAt
            });
        }
        else {
            await this._ownerRepository.update(String(user._id), {
                otp,
                otpExpiresAt,
                otpLastSentAt
            });
        }
        ;
        await this._otpService.sendEmail(user.email, otp, "emailVerification");
    }
    ;
    async verifyEmail(email) {
        if (email === "") {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Invalid email");
        }
        ;
        let user = await this._userRepository.findByEmail(email);
        if (!user) {
            user = await this._ownerRepository.findByEmail(email);
        }
        ;
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "User not found");
        }
        ;
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000);
        if (user.role === types_js_2.Role.USER) {
            await this._userRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
        }
        else {
            await this._ownerRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
        }
        ;
        this._otpService.sendEmail(email, resetToken, "passwordReset");
    }
    ;
    async resetPassword(token, newPwd) {
        let user = await this._userRepository.findOne({ resetToken: token });
        if (!user) {
            user = await this._ownerRepository.findOne({ resetToken: token });
        }
        ;
        if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Invalid or expired token");
        }
        ;
        const hashedPwd = await bcrypt_1.default.hash(newPwd, 10);
        await this._userRepository.update(String(user._id), { password: hashedPwd, resetToken: null, resetTokenExpiresAt: null });
    }
    ;
    async rotateRefreshToken(refreshToken) {
        if (!refreshToken)
            throw new http_error_js_1.HttpError(401, "No refresh token provided");
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        }
        catch (err) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
        }
        if (!decoded ||
            typeof decoded !== "object" ||
            !("userId" in decoded) ||
            typeof decoded.userId !== "string") {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
        }
        const payload = decoded;
        let user;
        if (payload.role === types_js_2.Role.USER) {
            user = await this._userRepository.findById(payload.userId);
        }
        else if (payload.role === types_js_2.Role.OWNER) {
            user = await this._ownerRepository.findById(payload.userId);
        }
        else if (payload.role === types_js_2.Role.ADMIN) {
            user = await this._adminRepository.findById(payload.userId);
        }
        if (!user || user.refreshToken !== refreshToken) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.FORBIDDEN, "Invalid or expired refresh token");
        }
        const { _id, role } = user;
        const newAccessToken = this._jwtService.generateAccessToken(String(_id), role);
        const newRefreshToken = this._jwtService.generateRefreshToken(String(_id), role);
        if (role === types_js_2.Role.USER) {
            await this._userRepository.update(String(_id), { refreshToken: newRefreshToken });
        }
        else if (role === types_js_2.Role.OWNER) {
            await this._ownerRepository.update(String(_id), { refreshToken: newRefreshToken });
        }
        else if (role === types_js_2.Role.ADMIN) {
            await this._adminRepository.update(String(_id), { refreshToken: newRefreshToken });
        }
        return {
            newAccessToken,
            newRefreshToken
        };
    }
    async logout(req, res) {
        const { user } = req;
        const userId = user?.userId;
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            throw new http_error_js_1.HttpError(204, "No token to logout");
        let updatedUser = null;
        updatedUser = await this._userRepository.update(userId, { refreshToken: null });
        if (!updatedUser) {
            updatedUser = await this._ownerRepository.update(userId, { refreshToken: null });
        }
        if (!updatedUser) {
            updatedUser = await this._adminRepository.update(userId, { refreshToken: null });
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        });
    }
    ;
    async getCurrentUser(userId) {
        let user = null;
        user = await this._userRepository.findById(userId);
        if (!user) {
            user = await this._ownerRepository.findById(userId);
        }
        ;
        if (!user) {
            user = await this._adminRepository.findById(userId);
        }
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "User not found");
        }
        if (user.role === types_js_2.Role.USER || user.role === types_js_2.Role.OWNER) {
            const safeUser = user;
            return {
                userName: safeUser.userName,
                email: safeUser.email,
                isBlocked: safeUser.isBlocked,
                role: safeUser.role,
                isVerified: safeUser.isVerified,
            };
        }
        else {
            return {
                email: user.email,
                role: user.role,
            };
        }
    }
    ;
};
AuthService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_js_1.default.IOwnerRepository)),
    __param(2, (0, inversify_1.inject)(types_js_1.default.IAdminRepository)),
    __param(3, (0, inversify_1.inject)(types_js_1.default.IOtpService)),
    __param(4, (0, inversify_1.inject)(types_js_1.default.IJwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AuthService);
exports.default = AuthService;
;
//# sourceMappingURL=auth.service.js.map