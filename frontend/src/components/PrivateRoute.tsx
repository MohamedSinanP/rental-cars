import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const checking = useAuthCheck();

  useEffect(() => {
    if (user && ['owner', 'user'].includes(user.role || '')) {
      if (user.isBlocked) {
        toast.error("You are blocked");
      } else if (!user.isVerified) {
        toast.warning("Please verify your account to continue");
      }
    }
  }, [user]);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-teal-500"></div>
      </div>
    );
  }

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
