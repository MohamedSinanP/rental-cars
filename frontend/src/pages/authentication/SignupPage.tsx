import { ChangeEvent, FormEvent, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/apis/authApi';
import { IUserSignup, UserInput } from '../../types/types';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';
import { getUserLocation } from '../../utils/getUserLocation';
import { sendUserLocation } from '../../services/apis/userApis';
import GoogleLoginButton from '../../components/GoogleLoginButton';

// Define a proper interface for validation errors
interface FormErrorsUser {
  userName?: string;
  email?: string;
  password?: string;
  confirmPwd?: string;
}

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<UserInput>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrorsUser>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (data: UserInput): FormErrorsUser => {
    const errors: FormErrorsUser = {};
    if (!data.userName.trim()) {
      errors.userName = "Username is required";
    } else if (data.userName.length < 4) {
      errors.userName = "Username must be at least 4 characters long";
    }
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email)) {
      errors.email = 'Email is invalid';
    }

    if (!data.password.trim()) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      errors.password = 'Must be at least 6 characters long and include a special character';
    }

    if (!data.confirmPassword.trim()) {
      errors.confirmPwd = "Confirm password is required";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPwd = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setErrors({});
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const userData: IUserSignup = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        role: "user",
      };
      const result = await signupUser(userData);

      if (result) {
        dispatch(setAuth({
          user: {
            userName: result.userName,
            email: result.email,
            role: result.role,
            isBlocked: result.isBlocked,
            isVerified: result.isVerified
          }
        }));
        const { location } = await getUserLocation();
        await sendUserLocation(result.id, location);
        navigate('/verify-otp');
      }

      setFormData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50">
      <div className="bg-white shadow-md shadow-teal-500/50 border border-teal-500 rounded-lg p-6 sm:p-10 w-full max-w-4xl flex flex-col sm:flex-row items-center">
        <div className="hidden sm:flex w-1/2 justify-center">
          <img
            src="/images/car1.jpg"
            alt="Car"
            className="w-80 h-80 rounded-full object-cover border border-teal-500"
          />
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-2xl font-bold text-center text-black mb-6">Create Account</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors?.userName && (
              <span className="text-red-500 text-sm">
                {errors.userName}
              </span>
            )}
            <input
              name="userName"
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.userName}
              onChange={handleChange}
            />
            {errors?.email && (
              <span className="text-red-500 text-sm">
                {errors.email}
              </span>
            )}
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.email}
              onChange={handleChange}
            />
            {errors?.password && (
              <span className="text-red-500 text-sm">
                {errors.password}
              </span>
            )}
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.password}
              onChange={handleChange}
            />
            {errors?.confirmPwd && (
              <span className="text-red-500 text-sm">
                {errors.confirmPwd}
              </span>
            )}
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <p className="text-sm text-black text-center">
              Already have an account?{" "}
              <NavLink to={'/login'}>
                <span className="font-bold text-teal-500 hover:text-teal-600 cursor-pointer">Login Now</span>
              </NavLink>
            </p>

            <button className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600 cursor-pointer">
              Sign Up
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

export default SignupPage;