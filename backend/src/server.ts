import http from "http";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import "./cron/booking.cron";

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

// Middlewares
app.use('/user/webhook', express.raw({ type: 'application/json' }));
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
app.use("/auth", authRoutes);
app.use("/auth", googleRoutes);
app.use("/admin", adminRoutes);
app.use("/owner", ownerRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);

// Global error handler
app.use(errorHandler as express.ErrorRequestHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
