import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { cancelSubscription } from '../services/apis/userApis';
import { useNavigate } from 'react-router-dom';

// Define types
type ActiveSubscription = {
  id: string;
  subscriptionId: {
    id: string;
    name: string;
    price: number;
    features?: string[];
    description?: string;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
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
  const [isProcessing, setIsProcessing] = useState(false);

  // Close confirmation modal when subscription becomes null or changes status
  useEffect(() => {
    if (!subscription || subscription.status !== 'active') {
      setShowConfirmation(false);
    }
  }, [subscription]);

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
    if (!subscription || isProcessing) return;

    try {
      setIsProcessing(true);
      const result = await cancelSubscription(subscription.id);
      toast.success(result.message || 'Subscription cancelled successfully');
      setShowConfirmation(false);
      onCancelSuccess();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
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

  // Check if subscription can be cancelled (only active subscriptions)
  const canCancel = subscription.status === 'active';

  // Render active subscription card
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {subscription.status === 'active' ? 'Active Subscription' : 'Subscription Details'}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              subscription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
            }`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Plan</h3>
            <p className="text-lg font-semibold">{subscription.subscriptionId.name}</p>
            {subscription.subscriptionId.description && (
              <p className="text-sm text-gray-600 mt-1">{subscription.subscriptionId.description}</p>
            )}
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

        {/* Features Section */}
        {subscription.subscriptionId.features && subscription.subscriptionId.features.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Plan Features</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {subscription.subscriptionId.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show different messages based on subscription status */}
        {subscription.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Subscription Cancelled</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your subscription has been cancelled. You'll continue to have access until {formatDate(subscription.currentPeriodEnd)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription.status === 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Subscription Completed</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your subscription has ended. Consider getting a new subscription to continue enjoying our services.
                </p>
              </div>
            </div>
          </div>
        )}

        {canCancel && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={confirmCancel}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {(subscription.status === 'cancelled' || subscription.status === 'completed') && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={navigateToSubscriptions}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Browse New Subscriptions
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Cancellation</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period ({formatDate(subscription?.currentPeriodEnd || '')}).
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelConfirmation}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSubscriptionCard;