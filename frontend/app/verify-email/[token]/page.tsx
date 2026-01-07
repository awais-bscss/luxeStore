"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { setEmailVerified } from "@/store/slices/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Prevent duplicate requests

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent duplicate requests
      if (hasVerified.current) {
        console.log('Already verifying, skipping...');
        return;
      }

      hasVerified.current = true;

      try {
        const token = params.token as string;

        const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
          method: 'GET',
        });

        const data = await response.json();
        console.log('Verification response:', data); // Debug

        if (data.success) {
          setStatus('success');
          setMessage(data.message);

          // Update Redux store immediately
          dispatch(setEmailVerified());

          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    if (params.token) {
      verifyEmail();
    }
  }, [params.token, router, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verifying Your Email...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ✅ Email Verified!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ❌ Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The link may have expired or already been used.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Go to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
