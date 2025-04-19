import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { verifyOtp, verifyResetOtp } from '../../services/apis/authApi';
import { otpData } from '../../types/types';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const ResetOtpPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.user.email as string);
  const [otp, setOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [seconds, setSeconds] = useState<number>(59);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resendOtp = () => {
    setSeconds(59);
  };

  // Function to handle OTP submission
  const handleSubmit = async () => {
    if (!otp.trim()) {
      setOtpError("OTP cannot be empty");
      return;
    }

    setOtpError("");
    try {
      const data: otpData = {
        email: email,
        otp: otp,
      };
      const result = await verifyResetOtp(data);
      toast.success(result.message);
      navigate('/reset-password');

    } catch (error: any) {
      toast.error(error.message);
    }

  };

  // To control the timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-white py-4">
        <div className="bg-white drop-shadow-md rounded-lg px-6 py-4 sm:p-10 w-full max-w-4xl">
          <div className="flex flex-col items-center mb-20">
            <img src="/images/otp-logo.jpg" alt="" className="w-40 h-32 drop-shadow-md" />
            <h2 className="text-stone-600 font-bold text-center">Otp Verification</h2>
          </div>
          <div>
            <div className="flex flex-col pl-5 items-center">
              <p className="text-left text-xs font-base pr-11 pb-4">
                An authentication code has been sent to your email
              </p>
              <div className="ml-80">
                <p className="text-red-400 text-sm">
                  00:{seconds < 10 ? `0${seconds}` : seconds}
                </p>
              </div>
              <div className="flex flex-col">
                {otpError && <p className="text-red-500 text-sm mt-1 py-0">{otpError}</p>}
                <input
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="Enter OTP here"
                  className="w-90 h-12 text-center border border-gray-300 rounded-md font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex">
                  <p className="text-sm">Don't receive a code?</p>
                  <button className="text-sm cursor-pointer text-blue-400" onClick={resendOtp}>
                    Resend
                  </button>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-90 h-12 border border-gray-300 rounded-md mt-6 cursor-pointer bg-blue-600 text-white hover:text-blue-600 hover:bg-gray-300"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetOtpPage;
