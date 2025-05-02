import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { verifyOtp, resendOtp as resendOtpApi } from '../../services/apis/authApi';
import { otpData } from '../../types/types';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const OtpPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.user.email as string);
  const role = useSelector((state: RootState) => state.auth.user.role as string);
  const [otp, setOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [seconds, setSeconds] = useState<number>(59);
  const [resending, setResending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Control the countdown timer
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, []);

  // CountDown function
  const startTimer = () => {
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
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (resending || seconds > 0) return;

    setResending(true);
    try {
      const result = await resendOtpApi(email);
      toast.success(result.message || "OTP resent successfully");
      setSeconds(59);
      startTimer();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setResending(false);
    }
  };

  // Handle OTP submission
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
      const result = await verifyOtp(data);
      dispatch(setAccessToken(result.data.token));
      toast.success(result.message);
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    };
  };
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
                <div className="flex items-center mt-2 space-x-1">
                  <p className="text-sm">Don't receive a code?</p>
                  <button
                    disabled={seconds > 0 || resending}
                    onClick={handleResendOtp}
                    className={`text-sm ml-1 ${seconds > 0 || resending
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-400 cursor-pointer"
                      }`}
                  >
                    {resending ? "Resending..." : "Resend"}
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

export default OtpPage;
