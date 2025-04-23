import React, { FormEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';

type Props = {
  onSubmit: (formData: { email: string; password: string }) => void;
  showGoogle?: boolean;
};

const LoginForm: React.FC<Props> = ({ onSubmit, showGoogle = false }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const validationErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    return validationErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        {errors.email && <p className="text-red-500 text-sm m-0">{errors.email}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className="w-full p-2 border border-gray-300 rounded"
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
          className="w-full p-2 border border-gray-300 rounded"
          onChange={handleChange}
        />
      </div>

      <div className="flex">
        <p className="text-xs font-light text-gray-600">
          Don&apos;t have an account?{' '}
          <NavLink to="/signup" className="text-sm font-medium cursor-pointer">
            Register Now
          </NavLink>
        </p>
        <p className="text-sm font-medium text-gray-600 ml-auto cursor-pointer">
          <NavLink to="/forget-password">Forgot password?</NavLink>
        </p>
      </div>

      <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 cursor-pointer">
        Login
      </button>

      {showGoogle && (
        <>
          <div className="flex items-center justify-center my-4">
            <div className="w-1/3 border-t border-gray-300"></div>
            <p className="mx-2 text-sm text-gray-500">OR Login with</p>
            <div className="w-1/3 border-t border-gray-300"></div>
          </div>
          <div className="flex items-center justify-center border border-gray-300 rounded-md px-4 py-2">
            <GoogleLoginButton />
          </div>
        </>
      )}
    </form>
  );
};

export default LoginForm;
