"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = require("../di/container");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// users managment (owners and consumers)
router.get('/fetch-users', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.fetchUsers.bind(container_1.adminController));
router.patch('/block-user/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.blockOrUnblockUser.bind(container_1.adminController));
router.get('/fetch-owners', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.fethcOwners.bind(container_1.adminController));
router.patch('/block-owner/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.blockOrUnblockOwner.bind(container_1.adminController));
// car verification and etc routes
router.get('/pending-cars', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.getPendingCars.bind(container_1.adminController));
router.patch('/verify-car/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.verifyCar.bind(container_1.adminController));
router.patch('/reject-car/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.adminController.rejectCar.bind(container_1.adminController));
router.get('/get-stats', (0, auth_middleware_1.authenticate)(["admin"]), container_1.dashboardController.getStatsForAdmin.bind(container_1.dashboardController));
router.get('/rental-stats/', (0, auth_middleware_1.authenticate)(["admin"]), container_1.dashboardController.getRentalStatsForAdmin.bind(container_1.dashboardController));
router.get('/rentals/', (0, auth_middleware_1.authenticate)(["admin"]), container_1.dashboardController.getAllBookingsForAdmin.bind(container_1.dashboardController));
router.get('/sales-report-pdf/', (0, auth_middleware_1.authenticate)(["admin"]), container_1.bookingController.getSalesReportPdf.bind(container_1.bookingController));
// subscription routes
router.post('/add-subscription', (0, auth_middleware_1.authenticate)(["admin"]), container_1.subscriptionController.createSubscription.bind(container_1.subscriptionController));
router.get('/get-subscriptions', (0, auth_middleware_1.authenticate)(["admin"]), container_1.subscriptionController.getSubscriptions.bind(container_1.subscriptionController));
router.put('/edit-subscription/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.subscriptionController.editSubscription.bind(container_1.subscriptionController));
router.get('/users-subscriptions', (0, auth_middleware_1.authenticate)(["admin"]), container_1.subscriptionController.getUsersSubscriptions.bind(container_1.subscriptionController));
router.patch('/change-user-subscription-status/:id', (0, auth_middleware_1.authenticate)(["admin"]), container_1.subscriptionController.changeUserSubscriptionStatus.bind(container_1.subscriptionController));
exports.default = router;
