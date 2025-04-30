"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_js_1 = require("../di/container.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = express_1.default.Router();
router.post('/cars/add-car', (0, auth_middleware_js_1.authenticate)(["owner"]), (req, res, next) => container_js_1.carController.createCar(req, res, next));
router.put('/cars/update', (0, auth_middleware_js_1.authenticate)(["owner"]), (req, res, next) => container_js_1.carController.editCar(req, res, next));
router.patch('/cars/reupload-docs/:id', (0, auth_middleware_js_1.authenticate)(["owner"]), (req, res, next) => container_js_1.carController.reuploadCarDocs(req, res, next));
router.post('/get-car-details/:id', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.carController.getCarDocsDetails.bind(container_js_1.carController));
router.get('/get-cars', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.carController.fetchOwnerVerifedCars.bind(container_js_1.carController));
router.get('/all-cars', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.carController.fetchOwnerAllCars.bind(container_js_1.carController));
router.get('/reverse-geocode', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.carController.getAddressFromCoordinates.bind(container_js_1.carController));
router.get('/bookings', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.bookingController.fetchOwnerAllBookings.bind(container_js_1.bookingController));
router.get('/bookings', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.bookingController.fetchOwnerAllBookings.bind(container_js_1.bookingController));
router.patch('/bookings/:id', (0, auth_middleware_js_1.authenticate)(["owner"]), container_js_1.bookingController.changeBookingStatus.bind(container_js_1.bookingController));
exports.default = router;
//# sourceMappingURL=owner.routes.js.map