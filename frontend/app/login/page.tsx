"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { login, clearError } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/toastSlice";

function LoginContent() {
  const { isDarkMode } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const reason = searchParams.get("reason");
  const redirect = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Always redirect admins to admin dashboard
      if (user?.role === "admin" || user?.role === "superadmin") {
        router.push("/admin");
      } else if (redirect && redirect !== '/') {
        // For regular users, honor the redirect parameter
        router.push(redirect);
      } else {
        // Default redirect for regular users
        router.push("/");
      }
    }
  }, [isAuthenticated, router, redirect, user]);

  useEffect(() => {
    if (reason === "session_expired") {
      dispatch(addToast({
        type: "warning",
        title: "Session Expired",
        message: "Your session has expired. Please log in again to continue."
      }));
    }
  }, [reason, dispatch]);

  const validateForm = (): boolean => {
    const errors = { email: "", password: "" };
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
    if (!validateForm()) return;

    try {
      await dispatch(login(formData)).unwrap();
      dispatch(addToast({
        type: "success",
        title: "Welcome Back!",
        message: "You have successfully logged in."
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: "error",
        title: "Login Failed",
        message: typeof err === "string" ? err : err.message || "An error occurred"
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationErrors({ ...validationErrors, [e.target.name]: "" });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link
          href="/"
          className={`inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className={`rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative">
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-white/80" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Login</h1>
            <p className="text-blue-100 text-sm">Welcome back to LuxeStore</p>
          </div>

          <div className="p-8">
            {reason === "session_expired" && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                  Your session has expired. This helps keep your account secure. Please log in again to continue where you left off.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600"} ${validationErrors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Password
                  </label>
                  <Link href="/forgot-password" className={`text-xs font-semibold ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600"} ${validationErrors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className={`mt-8 pt-6 border-t text-center ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Don't have an account?{" "}
                <Link href="/" className={`font-bold transition-colors ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}>
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
