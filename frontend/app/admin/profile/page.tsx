"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Camera, Save, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { uploadImage } from "@/utils/uploadUtils";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { RootState } from "@/store/store";
import { TwoFactorModal } from "@/components/profile/TwoFactorSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const handleImageUpload = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setMessage(null);

    try {
      console.log('Uploading image to Cloudinary...');
      const result = await uploadImage(imageFile);
      const imageUrl = result.url;
      console.log('Image uploaded successfully. URL:', imageUrl);
      setProfileImage(imageUrl);
      setImagePreview(null);
      setImageFile(null);
      setMessage({ type: 'success', text: 'Image uploaded successfully! Click "Save Changes" to update your profile.' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel image selection
  const handleCancelImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Save profile
  const handleSave = async () => {
    console.log('=== SAVING PROFILE ===');
    console.log('Name:', name);
    console.log('Profile Image:', profileImage);

    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        name,
        profileImage: profileImage || null,
      };
      console.log('Sending payload:', payload);

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        const userData = data.user || data.data?.user;

        if (userData) {
          // Update Redux store
          dispatch({
            type: 'auth/setCredentials',
            payload: {
              user: {
                ...user,
                name: userData.name || user?.name,
                profileImage: userData.profileImage || user?.profileImage,
              },
              token: user ? (user as any).token : (data.token || ''),
            },
          });
        }

        // Reload to update sidebar
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('Save failed:', data);
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage('');
    setImagePreview(null);
    setImageFile(null);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage your account settings and profile information
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className={`rounded-2xl shadow-xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Profile Image Section */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Profile Picture
            </h2>

            <div className="flex items-center gap-6">
              {/* Current/Preview Image */}
              <div className="relative">
                {(() => {
                  console.log('Image Display Debug:', {
                    imagePreview,
                    profileImage,
                    showImage: !!(imagePreview || profileImage),
                  });
                  return null;
                })()}
                {imagePreview || profileImage ? (
                  <img
                    src={imagePreview || profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-purple-500">
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}

                {(profileImage || imagePreview) && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {!imageFile ? (
                  <label
                    htmlFor="profile-image"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Choose Image
                  </label>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Upload Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelImage}
                      disabled={isUploading}
                      className={`px-6 py-3 rounded-xl font-semibold transition-colors ${isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  JPG, PNG or WebP. Max size 5MB.
                </p>

                {/* Debug Info */}
                {profileImage && (
                  <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current Image URL:
                    </p>
                    <p className={`text-xs break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profileImage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`my-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

          {/* Profile Information */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Profile Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                    }`}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className={`w-full px-4 py-3 border-2 rounded-xl opacity-60 cursor-not-allowed ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                />
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Email cannot be changed
                </p>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-lg font-semibold capitalize">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`my-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

          {/* Two-Factor Authentication Button */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Security
            </h2>
            <button
              onClick={() => setShow2FAModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Manage Two-Factor Authentication
            </button>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add an extra layer of security to your account
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2FA Modal */}
        <TwoFactorModal user={user} isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} />
      </div>
    </div>
  );
}
