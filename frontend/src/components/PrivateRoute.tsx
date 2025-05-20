import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && ['owner', 'user'].includes(user.role || '')) {
      if (user.isBlocked) {
        toast.error("You are blocked");
      } else if (!user.isVerified) {
        toast.warning("Please verify your account to continue");
      }
    }
  }, [user]);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (['owner', 'user'].includes(user.role || '') && user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  if (['owner', 'user'].includes(user.role || '') && !user.isVerified) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
