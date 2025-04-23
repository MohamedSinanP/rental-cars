import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { setAccessToken, setAuth } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { getUser } from '../../services/apis/userApis';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      dispatch(setAccessToken(token));
      const fetchUser = async () => {
        try {
          const result = await getUser(token);
          dispatch(setAuth({
            user: {
              userName: result.data.userName,
              email: result.data.email,
              role: result.data.role,
              isBlocked: result.data.isBlocked,
              isVerified: result.data.isVerified
            },
            accessToken: token
          }));
          navigate("/");
        } catch (error) {
          console.error("Failed to fetch user", error);
          navigate("/login");
        }
      };

      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
}

export default GoogleAuthCallback

