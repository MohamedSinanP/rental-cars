import jwt from "jsonwebtoken";
import { injectable } from "inversify";


export interface IJwtService {
  generateAccessToken(usreId: string, role: string): string;
  generateRefreshToken(userId: string, role: string): string;
  verifyAccessToken(token: string): { userId: string, role: string };
  verifyRefreshToken(token: string): void;
}

@injectable()
export class JwtService implements IJwtService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.accessTokenSecret, { expiresIn: "1m" });
  }

  generateRefreshToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.refreshTokenSecret, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): { userId: string; role: string } {
    try {
      return jwt.verify(token, this.accessTokenSecret) as { userId: string; role: string };
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token: string): { userId: string; role: string } {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as { userId: string; role: string };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}