"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, User, Mail, Lock, ShoppingBag, UserCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { signup, login, clearError, setCredentials } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, requiresTwoFactor, twoFactorUserId } = useAppSelector((state: any) => state.auth);

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setValidationErrors({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleClose = () => {
    dispatch(clearError());
    setTwoFactorCode("");
    onClose();
  };

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (authMode === "signup") {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      }

      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      }));
      return;
    }

    try {
      if (authMode === "signup") {
        // Always create user accounts - admin accounts must be created via backend
        const result = await dispatch(
          signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "user",
          })
        ).unwrap();

        if (result) {
          dispatch(addToast({
            type: 'success',
            title: '✅ Account Created!',
            message: `Welcome ${formData.name}! Check your email for a verification link.`
          }));

          onClose();
          // User can access admin dashboard via navbar after email verification
        }
      } else {
        const result = await dispatch(
          login({
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();

        if (result) {
          if (result.passwordExpired) {
            dispatch(addToast({
              type: 'warning',
              title: 'Password Expired',
              message: 'Your password has expired. Please update it immediately.'
            }));
          } else {
            dispatch(addToast({
              type: 'success',
              title: 'Login Successful!',
              message: `Welcome back, ${result.user.name}!`
            }));
          }

          onClose();

          // Only redirect for password expired case
          if (result.passwordExpired) {
            setTimeout(() => {
              router.push("/account?tab=settings&reason=password_expired");
            }, 500);
          }
          // For admins and regular users, they stay on current page
          // Admins can access dashboard via navbar link
        }
      }
    } catch (err: any) {
      console.error("Authentication error caught in AuthModal handleSubmit:", err);
      if (err instanceof TypeError) {
        console.error("TypeError details:", err.message, err.stack);
      }

      // Extract error message properly
      let errorMessage = 'An error occurred. Please try again.';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }

      dispatch(addToast({
        type: 'error',
        title: authMode === 'signup' ? 'Signup Failed' : 'Login Failed',
        message: errorMessage
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: "",
    });
  };

  const verify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      dispatch(addToast({
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter a valid 6-digit code'
      }));
      return;
    }

    setIsVerifying2FA(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/2fa/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: twoFactorUserId,
          token: twoFactorCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 2FA verified - Update Redux state
        const userData = data.user || data.data?.user;

        if (!userData) {
          console.error('2FA Success but no user data found in response:', data);
          throw new Error('User data missing from verification response');
        }

        dispatch(setCredentials({
          user: userData,
          token: data.token
        }));

        dispatch(addToast({
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back!'
        }));

        dispatch(clearError());
        onClose();

        // Full page redirect to ensure session is properly loaded and state is clean
        setTimeout(() => {
          if (userData.role === 'admin' || userData.role === 'superadmin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }, 500);
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Verification Failed',
          message: data.message || 'Invalid code'
        }));
        setTwoFactorCode("");
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      dispatch(addToast({
        type: 'error',
        title: 'Verification Failed',
        message: 'Failed to verify code'
      }));
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setValidationErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    dispatch(clearError());
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 z-10 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 ">
            {authMode === "signin" ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-center text-blue-100 text-sm">
            {authMode === "signin"
              ? "Sign in to access your account"
              : "Join us and start shopping today"}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm text-center">
              {typeof error === 'string' ? error : 'An error occurred'}
            </p>
          </div>
        )}

        <div className={`flex gap-2 p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <button
            onClick={() => switchMode("signin")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${authMode === "signin"
              ? isDarkMode
                ? "bg-gray-700 text-blue-400 shadow-md"
                : "bg-white text-blue-600 shadow-md"
              : isDarkMode
                ? "text-gray-400 hover:bg-gray-800"
                : "text-gray-600 hover:bg-white/50"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${authMode === "signup"
              ? isDarkMode
                ? "bg-gray-700 text-blue-400 shadow-md"
                : "bg-white text-blue-600 shadow-md"
              : isDarkMode
                ? "text-gray-400 hover:bg-gray-800"
                : "text-gray-600 hover:bg-white/50"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* 2FA Code Input */}
        {requiresTwoFactor ? (
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Two-Factor Authentication
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Verification Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 border-2 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none transition-colors duration-200 ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                  }`}
              />
            </div>

            <button
              onClick={verify2FA}
              disabled={isVerifying2FA || twoFactorCode.length !== 6}
              className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isVerifying2FA ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>

            <button
              onClick={() => {
                setTwoFactorCode("");
                dispatch(clearError());
              }}
              className={`w-full py-2 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ← Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {authMode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'} ${validationErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'} ${validationErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'} ${validationErrors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
              {authMode === "signin" && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/forgot-password';
                    }}
                    className={`text-xs font-semibold cursor-pointer ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              {authMode === "signup" && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Must be 6+ characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            {authMode === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'} ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <>{authMode === "signin" ? "Sign In" : "Create Account"}</>
              )}
            </button>

            {authMode === "signup" && (
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{" "}
                <Link href="/terms" className={`${isDarkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}`}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className={`${isDarkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}`}>
                  Privacy Policy
                </Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
