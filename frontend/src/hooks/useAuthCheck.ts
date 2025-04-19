import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import api from "../services/apis/api";

export const useAuthCheck = () => {
  const [checking, setChecking] = useState(true);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        setChecking(false);
        return;
      }

      try {
        await api.get("/auth/me");
      } catch (err) {
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [accessToken]);

  return checking;
};