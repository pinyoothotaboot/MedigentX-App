
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import MainLayout from './MainLayout';
import AuthGuard from './AuthGuard';

const AppRouter: React.FC = () => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  // Show loading spinner while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen bg-medical-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-medical-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthGuard>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />}
          />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </AuthGuard>
    </Router>
  );
};

export default AppRouter;
