import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import "./cron/booking.cron";
import { subscriptionController } from "./di/container";

dotenv.config();

// Data base connection
import connectDB from "./config/db";

// Passport strategy setup
import "./config/passport";

// Routes
import authRoutes from "./routes/auth.routes";
import googleRoutes from "./routes/google.auth.routes";
import ownerRoutes from "./routes/owner.routes";
import userRoutes from "./routes/user.routes";
import paymentRoutes from "./routes/payment.routes";
import adminRoutes from "./routes/admin.routes";

// Error middleware
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Connect database
connectDB();

// wehook router 
app.post('/api/user/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook.bind(subscriptionController));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);

// Global error handler
app.use(errorHandler as express.ErrorRequestHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
