import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/apis/authApi';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import LoginForm from '../../components/LoginForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const AdminLoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (accessToken && user?.role === "admin") {
      navigate('/admin/dashboard');
    }
  }, [user, accessToken, navigate]);

  const handleLogin = async (formData: { email: string; password: string }) => {
    try {
      const result = await adminLogin(formData);
      await dispatch(
        setAuth({
          user: {
            email: result.data.email,
            role: result.data.role,
          },
          accessToken: result.data.accessToken,
        })
      );
      if (result) {
        navigate('/admin/dashboard');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 sm:p-10 w-full max-w-4xl flex flex-col sm:flex-row items-center">
        <div className="hidden sm:flex w-1/2 justify-center">
          <img src="/images/car1.jpg" alt="Car" className="w-80 h-80 rounded-full object-cover" />
        </div>
        <div className="w-full sm:w-1/2">
          <h2 className="text-2xl font-bold text-center mb-6">Login Now</h2>
          <LoginForm onSubmit={handleLogin} showGoogle={false} />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
