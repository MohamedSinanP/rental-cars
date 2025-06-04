"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const container_1 = require("../di/container");
const attachUserIfExist_1 = require("../middlewares/attachUserIfExist");
const router = express_1.default.Router();
// public routes for users
router.get('/car-details/:id', container_1.carController.carDetails.bind(container_1.carController));
router.get('/cars/similar/:id', container_1.carController.similarCars.bind(container_1.carController));
router.get('/reverse-geocode', container_1.userController.fetchUserLocationAddress.bind(container_1.userController));
router.patch('/location/:id', container_1.userController.setUserLocation.bind(container_1.userController));
// user account related routes
router.get('/profile', (0, auth_middleware_1.authenticate)(['user']), container_1.userController.fetchUser.bind(container_1.userController));
router.get('/details', (0, auth_middleware_1.authenticate)(['user']), container_1.userController.getUserDetails.bind(container_1.userController));
router.get('/cars', attachUserIfExist_1.attachUserIfExists, container_1.carController.getAllCars.bind(container_1.carController));
router.get('/wallet', (0, auth_middleware_1.authenticate)(["user"]), container_1.userController.getUserWallet.bind(container_1.userController));
router.put('/update-profile', (0, auth_middleware_1.authenticate)(["user"]), container_1.userController.updateProfile.bind(container_1.userController));
router.put('/update-password', (0, auth_middleware_1.authenticate)(["user"]), container_1.userController.updatePassword.bind(container_1.userController));
router.patch('/update-profile-pic', (0, auth_middleware_1.authenticate)(["user"]), container_1.userController.uploadImage.bind(container_1.userController));
router.post('/add-review/:id', (0, auth_middleware_1.authenticate)(["user"]), container_1.reviewController.addReview.bind(container_1.reviewController));
router.get('/get-reviews/:id', container_1.reviewController.getAllCarReview.bind(container_1.reviewController));
// booking related routes
router.post('/book-car', (0, auth_middleware_1.authenticate)(['user']), container_1.bookingController.creatBooking.bind(container_1.bookingController));
router.get('/rentals', (0, auth_middleware_1.authenticate)(['user']), container_1.bookingController.fetchUserRentals.bind(container_1.bookingController));
router.get('/addresses', (0, auth_middleware_1.authenticate)(['user']), container_1.userController.fetchUserAddresses.bind(container_1.userController));
router.get('/latest-booking/:id', (0, auth_middleware_1.authenticate)(['user']), container_1.bookingController.getLatestBooking.bind(container_1.bookingController));
router.patch('/cancel-booking/:id', (0, auth_middleware_1.authenticate)(['user']), container_1.bookingController.cancelBooking.bind(container_1.bookingController));
router.get('/invoice/:id', (0, auth_middleware_1.authenticate)(['user']), container_1.bookingController.invoiceForUser.bind(container_1.bookingController));
// subscription related routes
router.get('/subscriptions', container_1.subscriptionController.getActiveSubscriptions.bind(container_1.subscriptionController));
router.get('/subscription', (0, auth_middleware_1.authenticate)(["user"]), container_1.subscriptionController.getUserSubscription.bind(container_1.subscriptionController));
router.post('/create-subscription', (0, auth_middleware_1.authenticate)(["user"]), container_1.subscriptionController.makeSubscription.bind(container_1.subscriptionController));
router.get('/subscriptions/all-stats', (0, auth_middleware_1.authenticate)(["user"]), container_1.subscriptionController.getUserAllSubscriptions.bind(container_1.subscriptionController));
router.patch('/subscriptions/:id/cancel', (0, auth_middleware_1.authenticate)(["user"]), container_1.subscriptionController.cancelUserSub.bind(container_1.subscriptionController));
router.get('/subscriptions/active', (0, auth_middleware_1.authenticate)(["user"]), container_1.subscriptionController.getUserActiveSub.bind(container_1.subscriptionController));
// wishlist related routes
router.post('/wishlist', (0, auth_middleware_1.authenticate)(["user"]), container_1.wishlistController.addToWishlist.bind(container_1.wishlistController));
router.delete('/wishlist/:id', (0, auth_middleware_1.authenticate)(["user"]), container_1.wishlistController.removeFromWishlist.bind(container_1.wishlistController));
router.get('/wishlist', (0, auth_middleware_1.authenticate)(["user"]), container_1.wishlistController.getWishlist.bind(container_1.wishlistController));
router.get('/wishlist/paginated', (0, auth_middleware_1.authenticate)(["user"]), container_1.wishlistController.getUserWishlist.bind(container_1.wishlistController));
exports.default = router;
