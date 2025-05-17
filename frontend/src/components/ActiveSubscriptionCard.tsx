import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { cancelSubscription } from '../services/apis/userApis';
import { useNavigate } from 'react-router-dom';

// Define types
type ActiveSubscription = {
  _id: string;
  subscriptionId: {
    _id: string;
    name: string;
    price: number;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
} | null;

type ActiveSubscriptionCardProps = {
  subscription: ActiveSubscription;
  loading: boolean;
  error: string | null;
  onCancelSuccess: () => void;
};

const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  subscription,
  loading,
  error,
  onCancelSuccess
}) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const result = await cancelSubscription(subscription._id);
      toast.success(result.message);
      setShowConfirmation(false);
      onCancelSuccess();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error('Failed to cancel subscription');
    }
  };

  const navigateToSubscriptions = () => {
    navigate('/subscription');
  };

  const confirmCancel = () => {
    setShowConfirmation(true);
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-20 bg-gray-100 rounded mb-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Active Subscription</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You don't have any active subscription</p>
          <button
            onClick={navigateToSubscriptions}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Get a New Subscription
          </button>
        </div>
      </div>
    );
  }

  // Render active subscription card
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Subscription</h2>
          {subscription.status === 'cancelled' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Cancelled
            </span>
          )}
          {subscription.status === 'completed' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Completed
            </span>
          )}
          {subscription.status !== 'cancelled' && subscription.status !== 'completed' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Plan</h3>
            <p className="text-lg font-semibold">{subscription.subscriptionId.name}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Price</h3>
            <p className="text-lg font-semibold">${subscription.subscriptionId.price.toFixed(2)}/month</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Current Period Start</h3>
            <p>{formatDate(subscription.currentPeriodStart)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Current Period End</h3>
            <p>{formatDate(subscription.currentPeriodEnd)}</p>
          </div>
        </div>
        {!subscription.cancelAtPeriodEnd && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={confirmCancel}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Cancellation</h3>
            <p className="mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelConfirmation}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSubscriptionCard;