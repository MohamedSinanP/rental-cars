import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import AccountSidebar from '../../layouts/users/AccountSidebar';
import { getUserProfile, updateProfile, updatePassword, updateProfilePic } from '../../services/apis/userApis';
import { Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import avatar_default from '../../assets/avatar-default.webp';
import { uploadToCloudinary } from '../../utils/cloudinaryUploader';

interface BasicInfoFormValues {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // Basic Info Form
  const {
    register: registerBasicInfo,
    handleSubmit: handleSubmitBasicInfo,
    reset: resetBasicInfo,
    formState: { errors: basicInfoErrors, isSubmitting: isSubmittingBasicInfo },
    setError: setBasicInfoError
  } = useForm<BasicInfoFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // For password confirmation validation
  const newPassword = watchPassword('newPassword');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUserProfile();

        // Set user details for profile display
        setUserName(result.data.userName || '');
        setUserRole(result.data.role || 'Product Design');

        // Set profile image if available
        if (result.data.profilePic) {
          setProfileImage(result.data.profilePic);
        };

        // Reset form values
        resetBasicInfo({
          name: result.data.userName || '',
          email: result.data.email || '',
          phone: result.data.phone || ''
        });
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error.message);
        setBasicInfoError('root', {
          type: 'manual',
          message: 'Failed to load user profile'
        });
      }
    };

    fetchData();
  }, [resetBasicInfo, setBasicInfoError]);

  const onSubmitBasicInfo = async (data: BasicInfoFormValues) => {
    try {
      console.log("this is working");

      const formData = new FormData();
      formData.append('userName', data.name);
      formData.append('email', data.email);

      const result = await updateProfile(formData);
      console.log(result, "tumdfkd");

      setUserName(result.data.userName);
      toast.success(result.message);
    } catch (error: any) {
      console.error('Basic info update failed:', error.message);
      setBasicInfoError('root', {
        type: 'manual',
        message: error.message || 'Failed to update profile information'
      });
    };
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      const formData = new FormData();
      formData.append('currentPwd', data.currentPassword);
      formData.append('newPwd', data.newPassword);
      const result = await updatePassword(formData);
      toast.success(result.message);
      resetPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Password update failed:', error.message);
      toast.error(error.message);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const cloudinaryUrl = await uploadToCloudinary(file);

      if (!cloudinaryUrl) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      setProfileImage(cloudinaryUrl);
      const formData = new FormData();
      formData.append('profilePic', cloudinaryUrl);

      const result = await updateProfilePic(formData);
      toast.success(result.message);
    } catch (error: any) {
      console.error('Image upload failed:', error);
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('profilePic', '');

      await updateProfilePic(formData);

      setProfileImage('');
      toast.success('Profile image removed successfully');
    } catch (error: any) {
      console.error('Failed to remove profile image:', error);
      toast.error('Failed to remove profile image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AccountSidebar />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full mt-16 lg:mt-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>

          {/* Profile Header with Avatar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div
                  className={`w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg ${uploading ? 'opacity-50' : ''
                    }`}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={userName || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) :
                    <img
                      src={avatar_default}
                      alt="Default Avatar"
                      className="w-full h-full object-cover"
                    />
                  }
                </div>

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-teal-700 transition-colors"
                >
                  <Camera size={18} className="text-white" />
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-800">{userName || 'User Name'}</h2>
                <p className="text-gray-600 mb-1">{userRole}</p>
              </div>

              <div className="mt-4 md:mt-0 md:ml-auto flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                >
                  Delete Photo
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Basic Information</h2>
            {basicInfoErrors.root && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {basicInfoErrors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmitBasicInfo(onSubmitBasicInfo)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                  <input
                    type="text"
                    {...registerBasicInfo('name', { required: 'Name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter your name"
                  />
                  {basicInfoErrors.name && <p className="text-red-500 text-sm mt-1">{basicInfoErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...registerBasicInfo('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Email address"
                  />
                  {basicInfoErrors.email && <p className="text-red-500 text-sm mt-1">{basicInfoErrors.email.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingBasicInfo}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-70"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Change Password</h2>
            {passwordErrors.root && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {passwordErrors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword &&
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword &&
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: value => value === newPassword || 'Passwords do not match',
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword &&
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-70"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;