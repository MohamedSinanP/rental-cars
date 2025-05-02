import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPwd } from "../../services/apis/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>("");
  const [newPwd, setNewPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");
  const [errors, setErrors] = useState<{ newPwd?: string; confirmPwd?: string }>({});

  useEffect(() => {
    const resetToken = searchParams.get("token");

    if (resetToken) {
      setToken(resetToken);
    } else {
      toast.error("Reset token not found");
    }
  }, [searchParams]);

  const validateForm = () => {
    const validationErrors: { newPwd?: string; confirmPwd?: string } = {};

    if (!newPwd.trim()) {
      validationErrors.newPwd = "New password cannot be empty";
    } else if (newPwd.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPwd)) {
      validationErrors.newPwd = "Password must be at least 6 characters and include a special character";
    }

    if (!confirmPwd.trim()) {
      validationErrors.confirmPwd = "Confirm password cannot be empty";
    } else if (newPwd !== confirmPwd) {
      validationErrors.confirmPwd = "Passwords do not match";
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
      const result = await resetPwd(token, newPwd);
      toast.success(result.message);
      navigate('/login');
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
          <img
            src="/images/car1.jpg"
            alt="Car"
            className="w-80 h-80 rounded-full object-cover"
          />
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
          <p className="text-sm font-md">Your previous password has been reset.</p>
          <p className="text-sm font-md pb-8">Please set a new password for your account.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.newPwd && <p className="text-red-500 text-sm m-0">{errors.newPwd}</p>}
            <input
              value={newPwd}
              type="password"
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setNewPwd(e.target.value)}
            />

            {errors.confirmPwd && <p className="text-red-500 text-sm m-0">{errors.confirmPwd}</p>}
            <input
              value={confirmPwd}
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setConfirmPwd(e.target.value)}
            />

            <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 cursor-pointer">
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
