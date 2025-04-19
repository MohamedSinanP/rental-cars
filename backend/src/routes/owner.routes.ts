import express from 'express';
import { carController } from '../di/container';
import { FileUploadRequest } from '../interfaces/car.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/cars/add-car', authenticate(["owner"]), (req, res, next) => carController.createCar(req as FileUploadRequest, res, next));
router.get('/get-cars', authenticate(["owner"]), carController.fetchOwnerCars.bind(carController));
router.get('/reverse-geocode', authenticate(["owner"]), carController.getAddressFromCoordinates.bind(carController));

export default router;