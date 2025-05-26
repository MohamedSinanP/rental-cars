import express from "express";
import { authController } from "../di/container";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post('/signup', authController.signupUser.bind(authController));
router.post('/signup-owner', authController.signupOwner.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/admin-login', authController.adminLogin.bind(authController));
router.post('/verify-otp', authController.verifyOtp.bind(authController));
router.post('/resend-otp', authController.resendOtp.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/verify-reset-otp', authController.verifyResetOtp.bind(authController));
router.patch('/reset-pwd', authController.resetPwd.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticate(["user", "owner", "admin"]), authController.logout.bind(authController));

export default router;