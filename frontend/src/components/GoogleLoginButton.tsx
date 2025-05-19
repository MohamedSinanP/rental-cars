import React from 'react';

const GoogleLoginButton: React.FC = () => {
  const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = () => {
    window.location.href = `${SERVER_URL}/auth/google`
  };

  return (
    <button
      onClick={handleLogin}
      className='flex items-center justify-center gap-2 px-4 py-2 cursor-pointer w-full'>
      <img src="/images/Google.jpg" alt="Google" className="w-6 h-6" />
      <span className="text-sm font-medium text-gray-700">Continue with Google</span>
    </button>
  )
}

export default GoogleLoginButton;