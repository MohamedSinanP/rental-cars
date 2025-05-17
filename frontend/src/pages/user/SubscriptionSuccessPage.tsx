import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from 'lucide-react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';

const SubscriptionSuccessPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      navigate('/');
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [location, navigate]);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-10">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-md w-full max-w-md text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Subscription Successful!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for subscribing. Your subscription is now active.
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionSuccessPage;
