"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = require("../di/container");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// car related routes
router.post('/cars/add-car', (0, auth_middleware_1.authenticate)(["owner"]), (req, res, next) => container_1.carController.createCar(req, res, next));
router.put('/cars/update', (0, auth_middleware_1.authenticate)(["owner"]), (req, res, next) => container_1.carController.editCar(req, res, next));
router.patch('/cars/reupload-docs/:id', (0, auth_middleware_1.authenticate)(["owner"]), (req, res, next) => container_1.carController.reuploadCarDocs(req, res, next));
router.patch('/cars/:carId/toggle-listing', (0, auth_middleware_1.authenticate)(["owner"]), container_1.carController.toggleCarListing.bind(container_1.carController));
router.post('/get-car-details/:id', (0, auth_middleware_1.authenticate)(["owner"]), container_1.carController.getCarDocsDetails.bind(container_1.carController));
router.get('/get-cars', (0, auth_middleware_1.authenticate)(["owner"]), container_1.carController.fetchOwnerVerifedCars.bind(container_1.carController));
router.get('/all-cars', (0, auth_middleware_1.authenticate)(["owner"]), container_1.carController.fetchOwnerAllCars.bind(container_1.carController));
router.get('/reverse-geocode', (0, auth_middleware_1.authenticate)(["owner"]), container_1.carController.getAddressFromCoordinates.bind(container_1.carController));
// booking related routes
router.get('/bookings', (0, auth_middleware_1.authenticate)(["owner"]), container_1.bookingController.fetchOwnerAllBookings.bind(container_1.bookingController));
router.get('/bookings', (0, auth_middleware_1.authenticate)(["owner"]), container_1.bookingController.fetchOwnerAllBookings.bind(container_1.bookingController));
router.patch('/bookings/:id', (0, auth_middleware_1.authenticate)(["owner"]), container_1.bookingController.changeBookingStatus.bind(container_1.bookingController));
// dashboard routes
router.get('/get-stats', (0, auth_middleware_1.authenticate)(["owner"]), container_1.dashboardController.getStatsForOwner.bind(container_1.dashboardController));
router.get('/rental-stats', (0, auth_middleware_1.authenticate)(["owner"]), container_1.dashboardController.getRentalStatsForOwner.bind(container_1.dashboardController));
exports.default = router;
