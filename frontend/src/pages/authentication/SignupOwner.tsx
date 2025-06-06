import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { signupOwner } from '../../services/apis/authApi';
import { IOwnerSignup, Owner } from '../../types/types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';

// Define a proper interface for validation errors
interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  commission?: string;
}

const SignupOwner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Owner>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    commission: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (data: Owner): FormErrors => {
    const errors: FormErrors = {};
    if (!data.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (data.fullName.length < 4) {
      errors.fullName = 'Full Name must be at least 4 characters long';
    }

    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email)) {
      errors.email = 'Email is invalid';
    }

    if (!data.password.trim()) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      errors.password = 'Password must be at least 6 characters long and include a special character';
    }

    if (!data.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.commission.trim()) {
      errors.commission = 'Commission percentage is required';
    } else if (isNaN(Number(data.commission)) || Number(data.commission) < 0 || Number(data.commission) > 100) {
      errors.commission = 'Commission must be a number between 0 and 100';
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const ownerData: IOwnerSignup = {
        userName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "owner",
        commision: Number(formData.commission)
      }
      const result = await signupOwner(ownerData);
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
      };
      navigate('/verify-otp');

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      commission: '',
    });
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
          <h2 className="text-2xl font-bold text-center text-black mb-6">Become A Host Now</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors?.fullName && <span className="text-red-500 text-sm">{errors.fullName}</span>}
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.fullName}
              onChange={handleChange}
            />

            {errors?.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            <input
              name="email"
              type="text"
              placeholder="Email"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.email}
              onChange={handleChange}
            />

            {errors?.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.password}
              onChange={handleChange}
            />

            {errors?.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {errors?.commission && <span className="text-red-500 text-sm">{errors.commission}</span>}
            <label htmlFor="commission" className="text-sm text-black">Specify the commission percentage.</label>
            <input
              name="commission"
              type="text"
              placeholder="Commission"
              className="w-full p-2 border border-teal-500 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder:text-black/60"
              value={formData.commission}
              onChange={handleChange}
            />

            <p className="text-sm text-black text-center">
              Already have an account?{" "}
              <NavLink to={'/login'}>
                <span className="font-bold text-teal-500 hover:text-teal-600 cursor-pointer">Login Now</span>
              </NavLink>
            </p>
            <button className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600 cursor-pointer">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupOwner;