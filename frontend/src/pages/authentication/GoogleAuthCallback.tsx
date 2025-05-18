import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAccessToken, setAuth } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { getUser } from '../../services/apis/userApis';
import { sendUserLocation } from '../../services/apis/userApis';
import { getUserLocation } from '../../utils/getUserLocation';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      dispatch(setAccessToken(token));

      const fetchUserAndHandleLocation = async () => {
        try {
          const result = await getUser(token);
          console.log("result : ", result);

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
          try {
            const { location } = await getUserLocation();
            await sendUserLocation(result.data.id, location);
          } catch (locationError) {
            console.error("Could not handle user location:", locationError);
          }

          navigate("/");
        } catch (error) {
          console.error("Failed to fetch user", error);
          navigate("/login");
        }
      };

      fetchUserAndHandleLocation();
    } else {
      navigate("/login");
    }
  }, [navigate, dispatch]);

  return null; // Or a loading indicator if preferred
}

export default GoogleAuthCallback