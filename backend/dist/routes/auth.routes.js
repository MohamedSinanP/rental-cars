"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_js_1 = require("../di/container.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = express_1.default.Router();
router.post('/signup', container_js_1.authController.signupUser.bind(container_js_1.authController));
router.post('/signup-owner', container_js_1.authController.signupOwner.bind(container_js_1.authController));
router.post('/login', container_js_1.authController.login.bind(container_js_1.authController));
router.post('/admin-login', container_js_1.authController.adminLogin.bind(container_js_1.authController));
router.post('/verify-otp', container_js_1.authController.verifyOtp.bind(container_js_1.authController));
router.post('/resend-otp', container_js_1.authController.resendOtp.bind(container_js_1.authController));
router.post('/verify-email', container_js_1.authController.verifyEmail.bind(container_js_1.authController));
router.post('/verify-reset-otp', container_js_1.authController.verifyResetOtp.bind(container_js_1.authController));
router.patch('/reset-pwd', container_js_1.authController.resetPwd.bind(container_js_1.authController));
router.post('/refresh', container_js_1.authController.refreshToken.bind(container_js_1.authController));
router.post('/logout', (0, auth_middleware_js_1.authenticate)(["user", "owner", "admin"]), container_js_1.authController.logout.bind(container_js_1.authController));
router.get('/me', (0, auth_middleware_js_1.authenticate)(["user", "owner", "admin"]), container_js_1.authController.getCurrentUser.bind(container_js_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map