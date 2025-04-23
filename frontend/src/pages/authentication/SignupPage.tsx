import { ChangeEvent, FormEvent, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/apis/authApi';
import { IUserSignup, UserInput } from '../../types/types';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';



const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<UserInput>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<any>();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (data: UserInput) => {
    const errors: any = {};
    if (!data.userName.trim()) {
      errors.userName = "Username is required"
    } else if (data.userName.length < 4) {
      errors.userName = "Username must be atleast 4 characters long"
    }
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }

    if (!data.password.trim()) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      errors.password = 'must be at least 6 characters long and include a special char';
    }

    if (!data.confirmPassword.trim()) {
      errors.confirmPwd = "Confirm password is required";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPwd = 'Passwords do not match';
    }

    return errors;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setErrors({});
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      console.log('Form submitted successfully!');
      const userData: IUserSignup = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        role: "user",

      }
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
        }))
        navigate('/verify-otp')
      }

      setFormData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error: any) {
      toast.error(error.message);
    }


  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-10 w-full max-w-4xl flex flex-col sm:flex-row items-center">
          <div className="hidden sm:flex w-1/2 justify-center">
            <img
              src="/images/car1.jpg"
              alt="Car"
              className="w-80 h-80 rounded-full object-cover"
            />
          </div>

          <div className="w-full sm:w-1/2">
            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errors?.userName && (
                <span className="text-red-500 text-sm">
                  {errors.userName}
                </span>
              )}
              <input
                name='userName'
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors?.email && (
                <span className="text-red-500 text-sm">
                  {errors.email}
                </span>
              )}
              <input
                name='email'
                type="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.email}
                onChange={handleChange}
              />
              {errors?.password && (
                <span className="text-red-500 text-sm">
                  {errors.password}
                </span>
              )}
              <input
                name='password'
                type="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.password}
                onChange={handleChange}
              />
              {errors?.confirmPwd && (
                <span className="text-red-500 text-sm">
                  {errors.confirmPwd}
                </span>
              )}
              <input
                name='confirmPassword'
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{" "}
                <NavLink to={'/login'}>
                  <span className="font-bold cursor-pointer">Login Now</span>
                </NavLink>
              </p>

              <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 cursor-pointer">
                Sign Up
              </button>
            </form>

            <div className="flex items-center justify-center my-4">
              <div className="w-1/3 border-t border-gray-300"></div>
              <p className="mx-2 text-sm text-gray-500">OR Login with </p>
              <div className="w-1/3 border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center gap-4 border border-gray-300 cursor-pointer">
              <img
                src="/images/Google.jpg"
                alt="Google"
                className="w-8 h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )

}

export default SignupPage
