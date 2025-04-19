import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "../pages/HomePage";
import SignupPage from "../pages/authentication/SignupPage";
import SignupOwner from "../pages/authentication/SignupOwner";
import LoginPage from "../pages/authentication/LoginPage";
import OtpPage from "../pages/authentication/OtpPage";
import ForgetPassword from "../pages/authentication/ForgetPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import ResetOtpPage from "../pages/authentication/ResetOtpPage";
import GoogleAuthCallback from "../pages/authentication/GoogleAuthCallback"

// Owner Pages
import Dashboard from "../pages/owners/Dashboard";
import Cars from "../pages/owners/Cars";

// private router component
import PrivateRoute from "../components/PrivateRoute";
import CarListingPage from "../pages/user/CarListingPage";
import CarDetailsPage from "../pages/user/CarDetailsPage";
import CarBookingPage from "../pages/user/CarBookingPage";
import UserProfile from "../pages/user/UserProfile";
import CarRentalsPage from "../pages/user/CarRentalsPage";

// Fallback / Errors
// import Unauthorized from "../pages/Unauthorized";
// import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/owner-signup" element={<SignupOwner />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<OtpPage />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-otp" element={<ResetOtpPage />} />
      <Route path='/auth/google' element={<GoogleAuthCallback />} />

      {/* Routes for owner */}
      < Route element={<PrivateRoute allowedRoles={['owner']} />}>
        <Route path="/owner/dashboard" element={<Dashboard />} />
        <Route path="/owner/cars" element={<Cars />} />
      </Route>
      {/* Private routes for user */}
      < Route element={<PrivateRoute allowedRoles={['user']} />}>
        <Route path="/car/booking/:id" element={<CarBookingPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/rentals" element={<CarRentalsPage />} />
      </Route>
      { /* Routes for the user */}
      <Route path="/car-details/:id" element={<CarDetailsPage />} />
      <Route path="/cars" element={<CarListingPage />} />

    </Routes>
  );
};

export default AppRoutes;
