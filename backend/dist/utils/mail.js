"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.OtpSerivce = exports.generateOtp = void 0;
const inversify_1 = require("inversify");
const mailer_1 = __importDefault(require("../config/mailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOtp = generateOtp;
let OtpSerivce = class OtpSerivce {
    sendEmail(email, value, purpose) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let subject = "";
                let htmlMessage = "";
                if (purpose === "emailVerification") {
                    subject = "Email Verification OTP";
                    htmlMessage = `<p>Your email verification OTP is: <strong>${value}</strong>. It will expire in 1 minutes.</p>`;
                }
                else if (purpose === "passwordReset") {
                    subject = "Reset Your Password";
                    htmlMessage = `<p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <p><a href="${process.env.CLIENT_URL}/reset-password?token=${value}">Reset Password</a></p>`;
                }
                yield mailer_1.default.sendMail({
                    from: `"Your App" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: subject,
                    text: purpose === "passwordReset"
                        ? `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${value}`
                        : `Your OTP is: ${value}. It will expire in 1 minutes.`,
                    html: htmlMessage,
                });
                console.log(`Email sent successfully for ${purpose}`);
            }
            catch (error) {
                console.log("Error sending email:", error);
                throw new Error("Oops, can't send email");
            }
        });
    }
};
exports.OtpSerivce = OtpSerivce;
exports.OtpSerivce = OtpSerivce = __decorate([
    (0, inversify_1.injectable)()
], OtpSerivce);
