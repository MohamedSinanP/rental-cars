import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { bookingController, carController, userController } from "../di/container";
const router = express.Router();


router.get('/profile', authenticate(['user']), userController.fetchUser.bind(userController));
router.get('/cars', carController.getAllCars.bind(carController));
router.get('/car-details/:id', carController.carDetails.bind(carController));
router.get('/cars/similar/:id', carController.similarCars.bind(carController));

// booking realted routes
router.post('/book-car', authenticate(['user']), bookingController.creatBooking.bind(bookingController));
router.post('/rentals', authenticate(['user']), bookingController.creatBooking.bind(bookingController));

export default router;