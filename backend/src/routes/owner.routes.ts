import express from 'express';
import { bookingController, carController } from '../di/container';
import { FileUploadRequest } from '../interfaces/controllers/car.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/cars/add-car', authenticate(["owner"]), (req, res, next) => carController.createCar(req as FileUploadRequest, res, next));
router.put('/cars/update', authenticate(["owner"]), (req, res, next) => carController.editCar(req as FileUploadRequest, res, next));
router.get('/get-cars', authenticate(["owner"]), carController.fetchOwnerVerifedCars.bind(carController));
router.get('/all-cars', authenticate(["owner"]), carController.fetchOwnerAllCars.bind(carController));
router.get('/reverse-geocode', authenticate(["owner"]), carController.getAddressFromCoordinates.bind(carController));
router.get('/bookings', authenticate(["owner"]), bookingController.fetchOwnerAllBookings.bind(bookingController));
router.get('/bookings', authenticate(["owner"]), bookingController.fetchOwnerAllBookings.bind(bookingController));
router.patch('/bookings/:id', authenticate(["owner"]), bookingController.changeBookingStatus.bind(bookingController));

export default router;