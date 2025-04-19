import { injectable } from "inversify";
import transporter from "../config/mailer";
import dotenv from "dotenv";
dotenv.config();


export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface IOtpService {
  sendEmail(email: string, otp: string, purpose: "emailVerification" | "passwordReset"): Promise<void>
}

@injectable()
export class OtpSerivce implements IOtpService {
  async sendEmail(email: string, value: string, purpose: "emailVerification" | "passwordReset"): Promise<void> {
    try {
      let subject = "";
      let htmlMessage = "";

      if (purpose === "emailVerification") {
        subject = "Email Verification OTP";
        htmlMessage = `<p>Your email verification OTP is: <strong>${value}</strong>. It will expire in 1 minutes.</p>`;
      } else if (purpose === "passwordReset") {
        subject = "Reset Your Password";
        htmlMessage = `<p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <p><a href="${process.env.CLIENT_URL}/reset-password?token=${value}">Reset Password</a></p>`;
      }

      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: purpose === "passwordReset"
          ? `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${value}`
          : `Your OTP is: ${value}. It will expire in 1 minutes.`,
        html: htmlMessage,
      });

      console.log(`Email sent successfully for ${purpose}`);
    } catch (error) {
      console.log("Error sending email:", error);
      throw new Error("Oops, can't send email");
    }
  }
}


