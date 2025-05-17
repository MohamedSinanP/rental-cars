import cron from "node-cron";
import { container } from "../di/container";
import TYPES from "../di/types";
import IBookingService from "../interfaces/services/booking.service";
import ISubscriptionService from "../interfaces/services/subscription.service";

const bookingService = container.get<IBookingService>(TYPES.IBookingService);
const subscriptionService = container.get<ISubscriptionService>(TYPES.ISubscriptionService);

cron.schedule("*/5 * * * *", async () => {
  try {
    const bookingResult = await bookingService.completeExpiredBookings();
    const subscriptionResult = await subscriptionService.markExpiredSubscriptionsAsCompleted();

    console.log(`[CRON] Bookings completed: ${bookingResult}`);
    console.log(`[CRON] Subscriptions marked completed: ${subscriptionResult}`);
  } catch (error) {
    console.error("[CRON] Failed to complete expired bookings or subscriptions:", error);
  }
});