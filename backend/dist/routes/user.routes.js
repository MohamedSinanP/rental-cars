"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const container_js_1 = require("../di/container.js");
const attachUserIfExist_js_1 = require("../middlewares/attachUserIfExist.js");
const router = express_1.default.Router();
router.get('/profile', (0, auth_middleware_js_1.authenticate)(['user']), container_js_1.userController.fetchUser.bind(container_js_1.userController));
router.get('/cars', attachUserIfExist_js_1.attachUserIfExists, container_js_1.carController.getAllCars.bind(container_js_1.carController));
router.get('/car-details/:id', container_js_1.carController.carDetails.bind(container_js_1.carController));
router.get('/cars/similar/:id', container_js_1.carController.similarCars.bind(container_js_1.carController));
router.get('/reverse-geocode', (0, auth_middleware_js_1.authenticate)(["user"]), container_js_1.userController.fetchUserLocationAddress.bind(container_js_1.userController));
router.patch('/location', (0, auth_middleware_js_1.authenticate)(["user"]), container_js_1.userController.setUserLocation.bind(container_js_1.userController));
// booking related routes
router.post('/book-car', (0, auth_middleware_js_1.authenticate)(['user']), container_js_1.bookingController.creatBooking.bind(container_js_1.bookingController));
router.get('/rentals', (0, auth_middleware_js_1.authenticate)(['user']), container_js_1.bookingController.fetchUserRentals.bind(container_js_1.bookingController));
router.get('/latest-booking/:id', (0, auth_middleware_js_1.authenticate)(['user']), container_js_1.bookingController.getLatestBooking.bind(container_js_1.bookingController));
// subscription related routes
router.get('/subscriptions', container_js_1.subscriptionController.getActiveSubscriptions.bind(container_js_1.subscriptionController));
router.get('/subscription', (0, auth_middleware_js_1.authenticate)(["user"]), container_js_1.subscriptionController.getUserSubscription.bind(container_js_1.subscriptionController));
router.post('/create-subscription', (0, auth_middleware_js_1.authenticate)(["user"]), container_js_1.subscriptionController.makeSubscription.bind(container_js_1.subscriptionController));
router.post('/webhook', container_js_1.subscriptionController.handleWebhook.bind(container_js_1.subscriptionController));
exports.default = router;
//# sourceMappingURL=user.routes.js.map