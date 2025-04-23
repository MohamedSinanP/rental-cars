import express from "express";
import { adminController } from "../di/container";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get('/fetch-users', authenticate(["admin"]), adminController.fetchUsers.bind(adminController));
router.get('/fetch-owners', authenticate(["admin"]), adminController.fethcOwners.bind(adminController));
router.get('/pending-cars', authenticate(["admin"]), adminController.getPendingCars.bind(adminController));
router.patch('/verify-car/:id', authenticate(["admin"]), adminController.verifyCar.bind(adminController));
router.patch('/reject-car/:id', authenticate(["admin"]), adminController.rejectCar.bind(adminController));


export default router;