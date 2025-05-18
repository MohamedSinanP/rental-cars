import { useState, useEffect } from 'react';
import { XCircleIcon } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addSubscription, updateSubscription } from '../services/apis/adminApi';

// Define your subscription data type
export type Subscription = {
  id: string;
  name: string;
  description: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
};

type SubscriptionFormData = Omit<Subscription, 'id' | 'features'>;

type SubscriptionModalProps = {
  isOpen: boolean;
  isEditing: boolean;
  currentSubscription: Subscription | null;
  onClose: () => void;
  onSubmit: (newSubscription: Subscription, mode: "add" | "edit") => void
};

const SubscriptionModal = ({
  isOpen,
  isEditing,
  currentSubscription,
  onClose,
  onSubmit
}: SubscriptionModalProps) => {
  // Setup form with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SubscriptionFormData>({
    defaultValues: {
      name: '',
      description: '',
      stripeProductId: '',
      stripePriceId: '',
      price: 0,
      billingCycle: 'monthly',
      isActive: true,
    },
    mode: 'onBlur' // Validate fields when they lose focus
  });

  // State for feature input and features array
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  // Reset form when editing different subscription or creating new one
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentSubscription) {
        // Load current subscription data into the form
        reset({
          name: currentSubscription.name,
          description: currentSubscription.description,
          stripeProductId: currentSubscription.stripeProductId,
          stripePriceId: currentSubscription.stripePriceId,
          price: currentSubscription.price,
          billingCycle: currentSubscription.billingCycle,
          isActive: currentSubscription.isActive,
        });

        // Set features separately in state
        setFeatures(Array.isArray(currentSubscription.features)
          ? [...currentSubscription.features]
          : []
        );
      } else {
        // Reset form for new subscription
        reset({
          name: '',
          description: '',
          stripeProductId: '',
          stripePriceId: '',
          price: 0,
          billingCycle: 'monthly',
          isActive: true,
        });
        setFeatures([]);
      }
    }
  }, [isOpen, isEditing, currentSubscription, reset]);

  // Handle features
  const addFeature = () => {
    if (featureInput.trim()) {
      const newFeatures = [...features, featureInput.trim()];
      setFeatures(newFeatures);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, idx) => idx !== index);
    setFeatures(newFeatures);
  };

  // Handle form submission
  const onFormSubmit: SubmitHandler<SubscriptionFormData> = async (data) => {
    try {
      // Validate features
      if (features.length === 0) {
        setError('description', { // Using description field to show error since features is not in the form
          type: 'manual',
          message: 'At least one feature is required'
        });
        return;
      }

      // Validate price
      if (data.price <= 0) {
        setError('price', {
          type: 'manual',
          message: 'Price must be greater than zero'
        });
        return;
      }

      // Prepare the final form data
      const formData = new FormData();

      // Add regular fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('stripeProductId', data.stripeProductId);
      formData.append('stripePriceId', data.stripePriceId);
      formData.append('price', data.price.toString());
      formData.append('billingCycle', data.billingCycle);
      formData.append('isActive', data.isActive.toString());

      // Add features array - we need to append each feature separately

      formData.append("features", JSON.stringify(features));


      let result;
      if (isEditing && currentSubscription) {
        result = await updateSubscription(currentSubscription.id, formData);
        toast.success(result.message || 'Subscription updated successfully');
        onSubmit({ ...data, features, id: currentSubscription.id }, "edit");
      } else {
        result = await addSubscription(formData);
        toast.success(result.message || 'Subscription created successfully');
        onSubmit({ ...data, features, id: result.id }, "add");
      }

      // Reset and close modal
      reset();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto z-50 pointer-events-auto">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="px-4 py-3 md:px-6 md:py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Plan name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                {...register('name', {
                  required: "Plan name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                  maxLength: { value: 50, message: "Name cannot exceed 50 characters" }
                })}
                className={`mt-1 block w-full border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                {...register('description', {
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" },
                  maxLength: { value: 500, message: "Description cannot exceed 500 characters" }
                })}
                rows={3}
                className={`mt-1 block w-full border ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Features <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Add a feature"
                  className="flex-1 border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-l-md shadow-sm py-2 px-3 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-md p-2">
                    <span className="flex-1 text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircleIcon size={16} />
                    </button>
                  </div>
                ))}
                {features.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No features added yet</p>
                )}
              </div>
            </div>

            {/* Price and Billing Cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: "Price is required",
                      min: { value: 0.01, message: "Price must be greater than zero" },
                      validate: {
                        positive: v => v > 0 || "Price must be positive",
                        format: v => !isNaN(v) || "Price must be a number"
                      }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        className={`block w-full border ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                          } rounded-md shadow-sm py-2 pl-7 pr-3 focus:outline-none`}
                      />
                    )}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <select
                  id="billingCycle"
                  {...register('billingCycle', { required: "Billing cycle is required" })}
                  className={`mt-1 block w-full border ${errors.billingCycle ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.billingCycle && (
                  <p className="mt-1 text-sm text-red-600">{errors.billingCycle.message}</p>
                )}
              </div>
            </div>

            {/* Stripe IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stripeProductId" className="block text-sm font-medium text-gray-700">
                  Stripe Product ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="stripeProductId"
                  {...register('stripeProductId', {
                    required: "Stripe Product ID is required",
                    pattern: {
                      value: /^prod_[A-Za-z0-9]+$/,
                      message: "Invalid product ID format (should start with 'prod_')"
                    }
                  })}
                  className={`mt-1 block w-full border ${errors.stripeProductId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none`}
                />
                {errors.stripeProductId && (
                  <p className="mt-1 text-sm text-red-600">{errors.stripeProductId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="stripePriceId" className="block text-sm font-medium text-gray-700">
                  Stripe Price ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="stripePriceId"
                  {...register('stripePriceId', {
                    required: "Stripe Price ID is required",
                    pattern: {
                      value: /^price_[A-Za-z0-9]+$/,
                      message: "Invalid price ID format (should start with 'price_')"
                    }
                  })}
                  className={`mt-1 block w-full border ${errors.stripePriceId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none`}
                />
                {errors.stripePriceId && (
                  <p className="mt-1 text-sm text-red-600">{errors.stripePriceId.message}</p>
                )}
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                )}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;