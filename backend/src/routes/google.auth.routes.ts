import express from "express";
import passport from "passport";
import { authController } from "../di/container";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.handleGoogleCallback.bind(authController)
);

export default router;
