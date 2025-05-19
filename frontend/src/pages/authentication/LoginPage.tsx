import React, { FormEvent, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { login } from '../../services/apis/authApi';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { sendUserLocation } from '../../services/apis/userApis';
import { getUserLocation } from '../../utils/getUserLocation';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { user, accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken || !user?.role) return;

    if (user.role === "user") {
      navigate('/');
    } else if (user.role === "owner") {
      navigate('/owner/dashboard');
    }

  }, [user, accessToken, navigate]);

  const validateForm = () => {
    const validationErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      validationErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    return validationErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await login(formData);
      await dispatch(setAuth({
        user: {
          userName: result.data.userDetails.user.userName,
          email: result.data.userDetails.user.email,
          role: result.data.userDetails.user.role,
          isBlocked: result.data.userDetails.user.isBlocked,
          isVerified: result.data.userDetails.user.isVerified
        },
        accessToken: result.data.userDetails.accessToken,
      }));
      if (result.data.userDetails.user.role === "owner") {
        navigate('/owner/dashboard');
      } else if (result.data.userDetails.user.role === "user") {
        try {
          const { location } = await getUserLocation();
          await sendUserLocation(result.data.userDetails.id, location);
        } catch (locationError) {
          console.error("Could not fetch location:", locationError);
        } finally {
          navigate('/');
        }
      }
      toast.success(result.message);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50 px-4">
      <div className="bg-white shadow-md shadow-teal-500/50 border border-teal-500 rounded-lg p-6 sm:p-10 w-full max-w-4xl flex flex-col sm:flex-row items-center">
        <div className="hidden sm:flex w-1/2 justify-center">
          <img
            src="/images/car1.jpg"
            alt="Car"
            className="w-80 h-80 rounded-full object-cover border border-teal-500"
          />
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-2xl font-bold text-center text-black mb-6">Login Now</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              {errors.email && <p className="text-red-500 text-sm m-0">{errors.email}</p>}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
                onChange={handleChange}
              />
            </div>
            <div>
              {errors.password && <p className="text-red-500 text-sm m-0">{errors.password}</p>}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
                onChange={handleChange}
              />
            </div>

            <div className="flex">
              <p className="text-xs font-light text-black">
                Don't have an account?{' '}
                <NavLink to="/signup" className="text-sm font-medium text-teal-500 hover:text-teal-600 cursor-pointer">
                  Register Now
                </NavLink>
              </p>

              <p className="text-sm font-medium text-teal-500 hover:text-teal-600 ml-auto cursor-pointer">
                <NavLink to="/forget-password">Forgot password?</NavLink>
              </p>
            </div>

            <button className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600 cursor-pointer">
              Login
            </button>
          </form>

          <div className="flex items-center justify-center my-4">
            <div className="w-1/3 border-t border-teal-500"></div>
            <p className="mx-2 text-sm text-black">OR Login with</p>
            <div className="w-1/3 border-t border-teal-500"></div>
          </div>
          <div className="flex items-center justify-center border border-teal-500 rounded-md px-4 py-2">
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;