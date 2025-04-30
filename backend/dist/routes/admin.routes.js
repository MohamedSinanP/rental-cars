"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_js_1 = require("../di/container.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = express_1.default.Router();
router.get('/fetch-users', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.fetchUsers.bind(container_js_1.adminController));
router.patch('/block-user/:id', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.blockOrUnblockUser.bind(container_js_1.adminController));
router.get('/fetch-owners', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.fethcOwners.bind(container_js_1.adminController));
router.patch('/block-owner/:id', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.blockOrUnblockOwner.bind(container_js_1.adminController));
router.get('/pending-cars', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.getPendingCars.bind(container_js_1.adminController));
router.patch('/verify-car/:id', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.verifyCar.bind(container_js_1.adminController));
router.patch('/reject-car/:id', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.adminController.rejectCar.bind(container_js_1.adminController));
// subscription routes
router.post('/add-subscription', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.subscriptionController.createSubscription.bind(container_js_1.subscriptionController));
router.get('/get-subscriptions', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.subscriptionController.getSubscriptions.bind(container_js_1.subscriptionController));
router.put('/edit-subscription/:id', (0, auth_middleware_js_1.authenticate)(["admin"]), container_js_1.subscriptionController.editSubscription.bind(container_js_1.subscriptionController));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map