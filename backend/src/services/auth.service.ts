import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import IAuthService from "../interfaces/services/auth.service";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { UserResponseDTO } from "../types/user";
import { adminLoginResponse, AuthCheck, IJwtToken, LoginGoogleResponse, LoginResponse, Role, StatusCode } from "../types/types";
import { generateOtp, IOtpService } from "../utils/mail";
import { HttpError } from "../utils/http.error";
import { IJwtService } from "../utils/jwt";
import { Request, Response } from "express";
import { OwnerResponseDTO } from "../types/owner";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import { Profile } from "passport-google-oauth20";
import { IUserModel } from "../types/user";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import IAdminRepository from "../interfaces/repositories/admin.repository";
import { IOwnerModel } from "../types/owner";
import { IAdminModel } from "../models/admin.model";

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESEND_OTP_COOLDOWN = 60 * 1000;

@injectable()
export default class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IOwnerRepository) private _ownerRepository: IOwnerRepository,
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IOtpService) private _otpService: IOtpService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {
  };

  async signupConsumer(userName: string, email: string, password: string, role: Role.USER): Promise<UserResponseDTO> {
    const existingUser =
      (await this._userRepository.findByEmail(email)) ||
      (await this._ownerRepository.findByEmail(email));

    if (existingUser) {
      throw new HttpError(StatusCode.CONFLICT, "The user with this email already exists");
    };

    const hashedPwd = await bcrypt.hash(password, 10);
    const otp = await generateOtp();
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
    })

    if (user) {
      this._otpService.sendEmail(user.email, otp, "emailVerification")
    };
    return {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      isBlocked: user.isBlocked,
      role: user.role,
      isVerified: user.isVerified,
    };
  };

  async signupOwner(userName: string, email: string, password: string, role: string, commision: number): Promise<OwnerResponseDTO> {
    const existingUser =
      (await this._ownerRepository.findByEmail(email)) ||
      (await this._userRepository.findByEmail(email));

    if (existingUser) {
      throw new HttpError(StatusCode.CONFLICT, "The user with this email already exists");
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const otp = await generateOtp();
    console.log('this is the owner otp', otp);

    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    const otpLastSentAt = new Date();

    const owner = await this._ownerRepository.register({
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
    })

    if (owner) {
      this._otpService.sendEmail(owner.email, otp, "emailVerification")
    };

    return {
      id: owner._id.toString(),
      userName: owner.userName,
      email: owner.email,
      isBlocked: owner.isBlocked,
      role: owner.role,
      isVerified: owner.isVerified,
    };
  };

  async adminLogin(email: string, password: string, res: Response): Promise<adminLoginResponse> {
    const user = await this._adminRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email or password");
    };

    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Password is incorrect");
    };

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
  };

  async login(email: string, password: string, res: Response): Promise<LoginResponse> {
    let user = await this._userRepository.findByEmail(email);
    if (!user) {
      user = await this._ownerRepository.findByEmail(email);
    };
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email or password");
    };

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email or password");
    };
    if (user.isBlocked) {
      throw new HttpError(StatusCode.FORBIDDEN, "Your account has been blocked");
    };
    if (!user.isVerified) {
      throw new HttpError(StatusCode.FORBIDDEN, "Please verify your email before logging in");
    };

    const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
    const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);

    if (user.role === Role.USER) {
      await this._userRepository.update(String(user._id), { refreshToken: refreshToken });
    } else {
      await this._ownerRepository.update(String(user._id), { refreshToken: refreshToken });
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return {
      accessToken,
      user: {
        _id: user._id.toString(),
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
      throw new HttpError(StatusCode.BAD_REQUEST, "Email not available from Google profile");
    }

    const email = profile.emails[0].value;
    let user = await this._userRepository.findByEmail(email);

    if (!user) {
      user = await this._userRepository.register({
        userName: profile.displayName,
        email,
        googleId: profile.id,
        role: Role.USER,
        isBlocked: false,
        isVerified: true,
      });
    }

    if (user.isBlocked) {
      throw new HttpError(StatusCode.FORBIDDEN, "Your account is blocked.");
    }

    const accessToken = this._jwtService.generateAccessToken(user.id.toString(), user.role);
    const refreshToken = this._jwtService.generateRefreshToken(user.id.toString(), user.role);

    await this._userRepository.update(String(user._id), { refreshToken });

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
  }



  async verifyOtp(email: string, otp: string, res: Response): Promise<IJwtToken> {
    let user = await this._userRepository.findByEmail(email);
    if (!user) {
      user = await this._ownerRepository.findByEmail(email);
    }
    if (!user) {
      throw new HttpError(StatusCode.NOT_FOUND, "User not found");
    };

    if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new HttpError(StatusCode.BAD_REQUEST, "OTP has expired. Please request once again");
    };

    if (user.otp !== otp) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invlid OTP. Please try again");
    };

    const accessToken = this._jwtService.generateAccessToken(String(user._id), user.role);
    const refreshToken = this._jwtService.generateRefreshToken(String(user._id), user.role);

    if (user.role === Role.USER) {
      await this._userRepository.findByEmailAndUpdate(user.email, refreshToken);
    } else {
      await this._ownerRepository.findByEmailAndUpdate(user.email, refreshToken);
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
    let user = await this._userRepository.findByEmail(email);
    if (!user) {
      user = await this._ownerRepository.findByEmail(email);
    };
    if (!user) {
      throw new HttpError(StatusCode.NOT_FOUND, "User not found");
    };

    if (user.isVerified) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User is already verified");
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
      await this._userRepository.update(String(user._id), {
        otp,
        otpExpiresAt,
        otpLastSentAt
      })
    } else {
      await this._ownerRepository.update(String(user._id), {
        otp,
        otpExpiresAt,
        otpLastSentAt
      })
    };

    await this._otpService.sendEmail(user.email, otp, "emailVerification");
  };

  async verifyEmail(email: string): Promise<void> {

    if (email === "") {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email");
    };

    let user = await this._userRepository.findByEmail(email);
    if (!user) {
      user = await this._ownerRepository.findByEmail(email);
    };

    if (!user) {
      throw new HttpError(StatusCode.NOT_FOUND, "User not found")
    };

    if (user.googleId) {
      throw new HttpError(
        StatusCode.BAD_REQUEST,
        "This account was created using Google. You can't reset the password."
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000);
    if (user.role === Role.USER) {
      await this._userRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });
    } else {
      await this._ownerRepository.update(String(user._id), { resetToken, resetTokenExpiresAt });

    };
    this._otpService.sendEmail(email, resetToken, "passwordReset");
  };


  async resetPassword(token: string, newPwd: string): Promise<void> {
    let user = await this._userRepository.findOne({ resetToken: token });
    let isOwner = false;

    if (!user) {
      user = await this._ownerRepository.findOne({ resetToken: token });
      isOwner = true;
    }

    if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      throw new HttpError(StatusCode.NOT_FOUND, "Invalid or expired token");
    }

    const hashedPwd = await bcrypt.hash(newPwd, 10);

    const updateData = {
      password: hashedPwd,
      resetToken: null,
      resetTokenExpiresAt: null,
    };

    if (isOwner) {
      await this._ownerRepository.update(String(user._id), updateData);
    } else {
      await this._userRepository.update(String(user._id), updateData);
    }
  }

  async rotateRefreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string; }> {
    if (!refreshToken) throw new HttpError(401, "No refresh token provided");
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET!);
    } catch (err) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
    }

    const payload = decoded as { userId: string, role: string };

    let user;

    if (payload.role === Role.USER) {
      user = await this._userRepository.findById(payload.userId);
    } else if (payload.role === Role.OWNER) {
      user = await this._ownerRepository.findById(payload.userId);
    } else if (payload.role === Role.ADMIN) {
      user = await this._adminRepository.findById(payload.userId);
    }

    if (!user || user.refreshToken !== refreshToken) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or expired refresh token");
    }

    const { _id, role } = user;

    const newAccessToken = this._jwtService.generateAccessToken(String(_id), role);
    const newRefreshToken = this._jwtService.generateRefreshToken(String(_id), role);

    if (role === Role.USER) {
      await this._userRepository.update(String(_id), { refreshToken: newRefreshToken });
    } else if (role === Role.OWNER) {
      await this._ownerRepository.update(String(_id), { refreshToken: newRefreshToken });
    } else if (role === Role.ADMIN) {
      await this._adminRepository.update(String(_id), { refreshToken: newRefreshToken });
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

    let updatedUser: IUserModel | IOwnerModel | IAdminModel | null = null;
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

  };

  async getCurrentUser(userId: string): Promise<AuthCheck> {
    let user: IUserModel | IOwnerModel | IAdminModel | null = null;
    user = await this._userRepository.findById(userId);
    if (!user) {
      user = await this._ownerRepository.findById(userId);
    };
    if (!user) {
      user = await this._adminRepository.findById(userId);
    }

    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User not found");
    }
    if (user.role === Role.USER || user.role === Role.OWNER) {
      const safeUser = user as IUserModel | IOwnerModel;
      return {
        userName: safeUser.userName,
        email: safeUser.email,
        isBlocked: safeUser.isBlocked,
        role: safeUser.role,
        isVerified: safeUser.isVerified,
      };
    } else {
      return {
        email: user.email,
        role: user.role,
      };
    };
  };
};


