import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { bookingController, carController, subscriptionController, userController } from "../di/container";
import { attachUserIfExists } from "../middlewares/attachUserIfExist";
const router = express.Router();


router.get('/profile', authenticate(['user']), userController.fetchUser.bind(userController));
router.get('/cars', attachUserIfExists, carController.getAllCars.bind(carController));
router.get('/car-details/:id', carController.carDetails.bind(carController));
router.get('/cars/similar/:id', carController.similarCars.bind(carController));
router.get('/reverse-geocode', authenticate(["user"]), userController.fetchUserLocationAddress.bind(userController));
router.patch('/location', authenticate(["user"]), userController.setUserLocation.bind(userController));

// booking related routes
router.post('/book-car', authenticate(['user']), bookingController.creatBooking.bind(bookingController));
router.get('/rentals', authenticate(['user']), bookingController.fetchUserRentals.bind(bookingController));
router.get('/addresses', authenticate(['user']), userController.fetchUserAddresses.bind(userController));
router.get('/latest-booking/:id', authenticate(['user']), bookingController.getLatestBooking.bind(bookingController));

// subscription related routes
router.get('/subscriptions', subscriptionController.getActiveSubscriptions.bind(subscriptionController));
router.get('/subscription', authenticate(["user"]), subscriptionController.getUserSubscription.bind(subscriptionController));
router.post('/create-subscription', authenticate(["user"]), subscriptionController.makeSubscription.bind(subscriptionController));
router.post('/webhook', subscriptionController.handleWebhook.bind(subscriptionController));

export default router;