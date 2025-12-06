
import React from 'react';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-medical-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-medical-50/50 to-gray-100/50 dark:from-slate-900 dark:to-slate-800"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Logo - Handled inside individual pages usually, but can be here too if generic */}
        
        {/* Auth Form Container */}
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
          {children}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Shield size={12} className="inline mr-1" />
            Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};
