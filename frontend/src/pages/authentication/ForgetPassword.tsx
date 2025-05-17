import { useState } from 'react';
import { verifyEmail } from '../../services/apis/authApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [emailError, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    setError("");
    try {
      const result = await verifyEmail(email);
      toast.success(result.message);
      navigate('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="bg-white shadow-lg shadow-teal-500/20 rounded-lg border border-teal-500 p-6 sm:p-10 w-full max-w-4xl flex flex-col sm:flex-row items-center">
        <div className="hidden sm:flex w-1/2 justify-center">
          <img
            src="/images/car1.jpg"
            alt="Car"
            className="w-80 h-80 rounded-full object-cover border-4 border-teal-500"
          />
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-2xl font-semibold text-center text-black mb-6">Forget Password?</h2>
          <div className="space-y-4">
            {emailError && (
              <p className="text-black text-sm mt-1 py-2 px-3 bg-teal-100 rounded">{emailError}</p>
            )}
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-teal-500 rounded-lg bg-white text-black placeholder-black focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-md cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;