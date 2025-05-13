import cron from "node-cron";
import { container } from "../di/container";
import TYPES from "../di/types";
import IBookingService from "../interfaces/services/booking.service";

const bookingService = container.get<IBookingService>(TYPES.IBookingService);

cron.schedule("*/5 * * * *", async () => {
  try {
    const result = await bookingService.completeExpiredBookings();
    console.log(`[CRON] Bookings completed: ${result}`);
  } catch (error) {
    console.error("[CRON] Failed to complete expired bookings:", error);
  }
});
