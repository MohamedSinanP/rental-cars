import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useAuthCheck } from "../hooks/useAuthCheck";

interface PrivateRouteProps {
  allowedRoles: string[];
};


const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {

  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const cheking = useAuthCheck();
  if (cheking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  };

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  };
  if (!allowedRoles.includes(user?.role as string)) {
    return <Navigate to="/unauthorized" replace />;
  };

  return <Outlet />;
};


export default PrivateRoute;

