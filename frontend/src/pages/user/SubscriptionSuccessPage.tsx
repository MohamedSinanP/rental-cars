// client/src/pages/SubscriptionSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from 'lucide-react';

const SubscriptionSuccessPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session ID in the URL (from Stripe redirect)
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      // No session ID, redirect to home
      navigate('/');
      return;
    }

    // Just for demo - in a real app you might want to verify the session
    // with your backend before showing success
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [location, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-md">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSuccessPage;