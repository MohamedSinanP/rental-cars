import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { bookingController, carController, userController } from "../di/container";
const router = express.Router();


router.get('/profile', authenticate(['user']), userController.fetchUser.bind(userController));
router.get('/cars', carController.getAllCars.bind(carController));
router.get('/car-details/:id', carController.carDetails.bind(carController));
router.get('/cars/similar/:id', carController.similarCars.bind(carController));
router.get('/reverse-geocode', authenticate(["user"]), userController.fetchUserLocationAddress.bind(userController));
router.patch('/location', authenticate(["user"]), userController.setUserLocation.bind(userController));

// booking realted routes
router.post('/book-car', authenticate(['user']), bookingController.creatBooking.bind(bookingController));
router.get('/rentals', authenticate(['user']), bookingController.fetchUserRentals.bind(bookingController));
router.get('/latest-booking/:id', authenticate(['user']), bookingController.getLatestBooking.bind(bookingController));

export default router;