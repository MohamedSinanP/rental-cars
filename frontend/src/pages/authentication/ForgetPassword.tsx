import { useState } from 'react'
import { verifyEmail } from '../../services/apis/authApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [emailError, setError] = useState<string>('');
  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email cannot be empty")
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    setError("");
    try {
      const result = await verifyEmail(email);
      console.log("this is heehe ", result);

      toast.success(result.message);
      navigate('/login')
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
            <h2 className="text-2xl font-semibold text-center mb-6">Forget Password ?</h2>
            <div className="space-y-4">
              {emailError && <p className="text-red-500 text-sm mt-1 py-0 m-0">{emailError}</p>}
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default ForgetPassword
