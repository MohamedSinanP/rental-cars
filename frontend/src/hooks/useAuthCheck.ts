import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import api from "../services/apis/api";
import { toast } from "react-toastify";
import { removeAuth } from "../redux/slices/authSlice";

export const useAuthCheck = () => {
  const [checking, setChecking] = useState(true);
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        setChecking(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        // Check if we got a successful response
        if (!response.data) {
          throw new Error("Failed to verify user session");
        }

      } catch (error: unknown) {
        console.error("Auth check failed:", error);

        if (error instanceof Error &&
          (error.message.includes("401") || error.message.includes("unauthorized"))) {
          toast.error("Your session has expired. Please login again.");
          dispatch(removeAuth());
        }
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [accessToken, user, dispatch]);

  return checking;
};