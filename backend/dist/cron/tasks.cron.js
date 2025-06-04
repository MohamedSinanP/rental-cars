"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const container_1 = require("../di/container");
const types_1 = __importDefault(require("../di/types"));
const bookingService = container_1.container.get(types_1.default.IBookingService);
const subscriptionService = container_1.container.get(types_1.default.ISubscriptionService);
node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingResult = yield bookingService.completeExpiredBookings();
        const subscriptionResult = yield subscriptionService.markExpiredSubscriptionsAsCompleted();
        const pendingDeleted = yield subscriptionService.deleteStalePendingSubscriptions();
        console.log(`[CRON] Bookings completed: ${bookingResult}`);
        console.log(`[CRON] Subscriptions marked completed: ${subscriptionResult}`);
        console.log(`[CRON] pending subscriptions deleted: ${pendingDeleted}`);
    }
    catch (error) {
        console.error("[CRON] Failed to complete expired bookings or subscriptions:", error);
    }
}));
