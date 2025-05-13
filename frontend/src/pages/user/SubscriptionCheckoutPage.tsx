import { useState, useEffect } from 'react';
import Navbar from '../../layouts/users/NavBar';
import { ISubscription } from '../../types/types';
import { getValidSubscriptions, makeSubscription } from '../../services/apis/userApis';
import Footer from '../../layouts/users/Footer';
import { toast } from 'react-toastify';

const SubscriptionCheckout = () => {
  const [plans, setPlans] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const result = await getValidSubscriptions();
        setPlans(result.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = async (plan: ISubscription) => {
    try {
      const priceId = plan.stripePriceId;
      const subId = plan._id!;
      const result = await makeSubscription(priceId, subId);
      console.log(result, "this is what>>>>>>");

      window.location.href = result.url;
      toast.success(result);

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    };

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-teal-400 mb-4"></div>
          <p className="text-teal-600 text-lg font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600 text-lg font-medium text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">Select the perfect subscription that fits your needs</p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto">
            <p className="text-center text-gray-600 text-lg">No active plans available at the moment.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 transition-colors"
            >
              Refresh Plans
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100"
                >
                  <div className="bg-gradient-to-br from-teal-500 to-teal-400 text-white p-6">
                    <h2 className="text-xl md:text-2xl font-semibold mb-2 text-center">{plan.name}</h2>
                    <div className="text-4xl md:text-5xl font-bold text-center mb-2">
                      {plan.price}
                      <span className="text-lg md:text-xl font-normal ml-1 opacity-90">{plan.billingCycle}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow">
                    <ul className="space-y-4 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-teal-500 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full bg-teal-500 text-white font-medium py-3 rounded-lg hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      Choose Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionCheckout;