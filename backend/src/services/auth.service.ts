import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { inject, injectable } from "inversify";
import IAuthService from "../interfaces/auth.service";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/user.repository";
import IUser, { IUserGoogle, userData } from "../types/user";
import { IJwtToken, LoginGoogleResponse, LoginResponse, Role } from "../types/types";
import { generateOtp, IOtpService } from "../utils/mail";
import { HttpError } from "../utils/http.error";
import { IJwtService } from "../utils/jwt";
import { Request, Response } from "express";
import IOwner from "../types/owner";
import IOwnerRepository from "../interfaces/owner.repository";
import { Profile } from "passport-google-oauth20";
import { IUserModel } from "../models/user.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESEND_OTP_COOLDOWN = 60 * 1000;

@injectable()
export default class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IOwnerRepository) private ownerRepository: IOwnerRepository,
    @inject(TYPES.IOtpService) private otpService: IOtpService,
    @inject(TYPES.IJwtService) private jwtService: IJwtService
  ) {
  };

  async signupConsumer(userName: string, email: string, password: string, role: Role.USER): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, "The user with this email already exist");
    };

    const hashedPwd = await bcrypt.hash(password, 10);
    const otp = await generateOtp();
    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    const otpLastSentAt = new Date();

    console.log(otp, "cosumer");

    const user = await this.userRepository.register({
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
    })

    if (user) {
      this.otpService.sendEmail(user.email, otp, "emailVerification")
    };
    return {
      userName: user.userName,
      email: user.email,
      password: user.password,
      isBlocked: user.isBlocked,
      role: user.role,
      isVerified: user.isVerified,
    };
  };

  async signupOwner(userName: string, email: string, password: string, role: string, commision: number): Promise<IOwner> {
    const existingUser = await this.ownerRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, "The user with this email already exist");
    };

    const hashedPwd = await bcrypt.hash(password, 10);
    const otp = await generateOtp();
    console.log('this is the owner otp', otp);

    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    const otpLastSentAt = new Date();

    const owner = await this.ownerRepository.register({
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
    })

    if (owner) {
      this.otpService.sendEmail(owner.email, otp, "emailVerification")
    };

    return {
      userName: owner.userName,
      email: owner.email,
      password: owner.password,
      isBlocked: owner.isBlocked,
      role: owner.role,
      commision: owner.commision,
      isVerified: owner.isVerified,
    }
  }

  async login(email: string, password: string, res: Response): Promise<LoginResponse> {
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.ownerRepository.findByEmail(email);
    };
    if (!user) {
      throw new HttpError(400, "Invalid email or password");
    };

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      throw new HttpError(400, "Invalid email or password");
    };
    if (user.isBlocked) {
      throw new HttpError(403, "Your account has been blocked");
    };
    if (!user.isVerified) {
      throw new HttpError(403, "Please verify your email before logging in");
    };

    const accessToken = this.jwtService.generateAccessToken(user.id.toString(), user.role);
    const refreshToken = this.jwtService.generateRefreshToken(user.id.toString(), user.role);

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

  };

  async googleAuth(profile: Profile): Promise<LoginGoogleResponse> {
    if (!profile.emails || !profile.emails[0]?.value) {
      throw new HttpError(400, "Email not available from Google profile");
    }

    const email = profile.emails[0].value;
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.userRepository.register({
        userName: profile.displayName,
        email,
        googleId: profile.id,
        role: Role.USER,
        isBlocked: false,
        isVerified: true,
      });
    };

    const accessToken = this.jwtService.generateAccessToken(user.id.toString(), user.role);
    const refreshToken = this.jwtService.generateRefreshToken(user.id.toString(), user.role);

    await this.userRepository.update(String(user._id), { refreshToken: refreshToken });

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
  };


  async verifyOtp(email: string, otp: string, res: Response): Promise<IJwtToken> {
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.ownerRepository.findByEmail(email);
    }
    if (!user) {
      throw new HttpError(404, "User not found");
    };

    if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new HttpError(400, "OTP has expired. Please request once again");
    };

    if (user.otp !== otp) {
      throw new HttpError(400, "Invlid OTP. Please try again");
    };

    const accessToken = this.jwtService.generateAccessToken(String(user._id), user.role);
    const refreshToken = this.jwtService.generateRefreshToken(String(user._id), user.role);

    if (user.role === Role.USER) {
      await this.userRepository.findByEmailAndUpdate(user.email, refreshToken);
    } else {
      await this.ownerRepository.findByEmailAndUpdate(user.email, refreshToken);
    }


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    return { accessToken };

  };

  async resendOtp(email: string): Promise<void> {
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.ownerRepository.findByEmail(email);
    };
    if (!user) {
      throw new HttpError(404, "User not found");
    };

    if (user.isVerified) {
      throw new HttpError(400, "User is already verified");
    };

    const now = Date.now();

    if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < RESEND_OTP_COOLDOWN) {
      const remainingTime = Math.ceil((RESEND_OTP_COOLDOWN - (now - user.otpLastSentAt.getTime())) / 1000);
      throw new HttpError(429, `Please wait ${remainingTime} seconds before requesting a new OTP`);
    };

    const otp = await generateOtp();
    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    const otpLastSentAt = new Date();
    console.log("this is your otp", otp);

    if (user.role === Role.USER) {
      await this.userRepository.update(String(user._id), {
        otp,
        otpExpiresAt,
        otpLastSentAt
      })
    } else {
      await this.ownerRepository.update(String(user._id), {
        otp,
        otpExpiresAt,
        otpLastSentAt
      })
    };

    await this.otpService.sendEmail(user.email, otp, "emailVerification");
  };

  async verifyEmail(email: string): Promise<void> {

    if (email === "") {
      throw new HttpError(400, "Invalid email");
    };

    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.ownerRepository.findByEmail(email);
    };

    if (!user) {
      throw new HttpError(404, "User not found")
    };

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000);
    if (user.role === Role.USER) {
      await this.userRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
    } else {
      await this.ownerRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });

    }

    this.otpService.sendEmail(email, resetToken, "passwordReset");
  };


  async resetPassword(token: string, newPwd: string): Promise<void> {
    let user = await this.userRepository.findOne({ resetToken: token });
    if (!user) {
      user = await this.ownerRepository.findOne({ resetToken: token });
    };

    if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      throw new HttpError(404, "Invalid or expired token");
    };

    const hashedPwd = await bcrypt.hash(newPwd, 10);

    await this.userRepository.update(String(user._id), { password: hashedPwd, resetToken: null, resetTokenExpiresAt: null });
  };

  async rotateRefreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string; }> {
    if (!refreshToken) throw new HttpError(401, "No refresh token provided");

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET!);
    } catch (err) {
      throw new HttpError(403, "Invalid or malformed refresh token");
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      throw new HttpError(403, "Invalid or malformed refresh token");
    }

    const payload = decoded as { userId: string, role: string };

    let user = await this.userRepository.findById(payload.userId);
    if (!user) {
      user = await this.ownerRepository.findById(payload.userId);
    }
    if (!user || user.refreshToken !== refreshToken) {
      throw new HttpError(403, "Invalid or expired refresh token");
    }

    const { _id, role } = user;

    const newAccessToken = this.jwtService.generateAccessToken(String(_id), role);
    const newRefreshToken = this.jwtService.generateRefreshToken(String(_id), role);

    if (role === Role.USER) {
      await this.userRepository.update(String(_id), { refreshToken: newRefreshToken });
    } else {
      await this.ownerRepository.update(String(_id), { refreshToken: newRefreshToken });
    }

    return {
      newAccessToken,
      newRefreshToken
    };
  }



  async logout(req: Request, res: Response): Promise<void> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new HttpError(204, "No token to logout");

    let updatedUser = await this.userRepository.update(userId, { refreshToken: null });
    if (!updatedUser) {
      updatedUser = await this.ownerRepository.update(userId, { refreshToken: null });
    };
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
    });

  };

  async getCurrentUser(userId: string): Promise<IUser> {
    let user = await this.userRepository.findById(userId);
    if (!user) {
      user = await this.ownerRepository.findById(userId);
    };
    if (!user) {
      throw new HttpError(400, "User not found");
    }
    return {
      userName: user.userName,
      email: user.email,
      password: user.password,
      isBlocked: user.isBlocked,
      role: user.role,
      isVerified: user.isVerified,
    };
  };
};


