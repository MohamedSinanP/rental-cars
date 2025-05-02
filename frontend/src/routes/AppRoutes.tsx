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
import CarAddedHistoryPage from "../pages/owners/CarAddedHistoryPage";
import OwnerBookingsPage from "../pages/owners/OwnerBookingsPage";

// private router component
import PrivateRoute from "../components/PrivateRoute";

import CarListingPage from "../pages/user/CarListingPage";
import CarDetailsPage from "../pages/user/CarDetailsPage";
import CarBookingPage from "../pages/user/CarBookingPage";
import UserProfile from "../pages/user/UserProfile";
import CarRentalsPage from "../pages/user/CarRentalsPage";
import Dashboars from "../pages/admin/Dashboard";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import UsersPage from "../pages/admin/UsersPage";
import OwnersPage from "../pages/admin/OwnersPage";
import CarVerification from "../pages/admin/CarVerification";
import BookingSuccessPage from "../pages/user/BookingSuccessPage";
import SubscriptionPage from "../pages/admin/SubscriptionPage";
import SubscriptionCheckout from "../pages/user/SubscriptionCheckoutPage";
import SubscriptionSuccessPage from "../pages/user/SubscriptionSuccessPage";
import UserSubscriptionsPage from "../pages/admin/UsersSubscriptionsPage";
import WalletPage from "../pages/user/WalletPage";

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
        <Route path="/owner/car-history" element={<CarAddedHistoryPage />} />
        <Route path="/owner/rentals" element={<OwnerBookingsPage />} />
      </Route>

      {/* Private routes for user */}
      < Route element={<PrivateRoute allowedRoles={['user']} />}>
        <Route path="/car/booking/:id" element={<CarBookingPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/rentals" element={<CarRentalsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/greetings/:id" element={<BookingSuccessPage />} />
      </Route>

      { /* Routes for the user */}
      <Route path="/car-details/:id" element={<CarDetailsPage />} />
      <Route path="/cars" element={<CarListingPage />} />
      <Route path='/subscription' element={<SubscriptionCheckout />} />
      <Route path='/subscription/success' element={<SubscriptionSuccessPage />} />

      { /* Routes for the admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      < Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<Dashboars />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/owners" element={<OwnersPage />} />
        <Route path="/admin/approvals" element={<CarVerification />} />
        <Route path="/admin/subscription" element={<SubscriptionPage />} />
        <Route path="/admin/user-subscription" element={<UserSubscriptionsPage />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
