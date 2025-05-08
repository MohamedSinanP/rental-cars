import express from "express";
import { adminController, dashboardController, subscriptionController } from "../di/container";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get('/fetch-users', authenticate(["admin"]), adminController.fetchUsers.bind(adminController));
router.patch('/block-user/:id', authenticate(["admin"]), adminController.blockOrUnblockUser.bind(adminController));
router.get('/fetch-owners', authenticate(["admin"]), adminController.fethcOwners.bind(adminController));
router.patch('/block-owner/:id', authenticate(["admin"]), adminController.blockOrUnblockOwner.bind(adminController));
router.get('/pending-cars', authenticate(["admin"]), adminController.getPendingCars.bind(adminController));
router.patch('/verify-car/:id', authenticate(["admin"]), adminController.verifyCar.bind(adminController));
router.patch('/reject-car/:id', authenticate(["admin"]), adminController.rejectCar.bind(adminController));
router.get('/get-stats', authenticate(["admin"]), dashboardController.getStatsForAdmin.bind(dashboardController));
router.get('/rental-stats/', authenticate(["admin"]), dashboardController.getRentalStatsForAdmin.bind(dashboardController));
router.get('/rentals/', authenticate(["admin"]), dashboardController.getAllBookingsForAdmin.bind(dashboardController));

// subscription routes
router.post('/add-subscription', authenticate(["admin"]), subscriptionController.createSubscription.bind(subscriptionController));
router.get('/get-subscriptions', authenticate(["admin"]), subscriptionController.getSubscriptions.bind(subscriptionController));
router.put('/edit-subscription/:id', authenticate(["admin"]), subscriptionController.editSubscription.bind(subscriptionController));
router.get('/users-subscriptions', authenticate(["admin"]), subscriptionController.getUsersSubscriptions.bind(subscriptionController));
router.patch('/change-user-subscription-status/:id', authenticate(["admin"]), subscriptionController.changeUserSubscriptionStatus.bind(subscriptionController));



export default router;