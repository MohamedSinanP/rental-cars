"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_js_1 = require("../di/container.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = express_1.default.Router();
router.post('/intent', (0, auth_middleware_js_1.authenticate)(["user"]), container_js_1.paymentController.createPaymentIntent.bind(container_js_1.paymentController));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map