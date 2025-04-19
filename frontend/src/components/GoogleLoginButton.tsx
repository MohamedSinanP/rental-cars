import React from 'react';

const GoogleLoginButton: React.FC = () => {

  const SERVER_URL = import.meta.env.VITE_API_BASE_URL;
  const handleLogin = () => {
    window.location.href = `${SERVER_URL}/auth/google`
  };

  return (
    <button
      onClick={handleLogin}
      className='px-40 cursor-pointer'>
      <img src="/images/Google.jpg" alt="Google" className="w-8 h-8" />
    </button>
  )
}

export default GoogleLoginButton;
