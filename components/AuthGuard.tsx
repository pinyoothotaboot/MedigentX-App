
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { logoutUser } from '../store/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

    // If on a public route, no need to check authentication
    if (isPublicRoute) {
      return;
    }

    // Check if user should be authenticated but isn't
    if (!isAuthenticated || !token) {
      console.log('🔒 AuthGuard: User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

  }, [isAuthenticated, user, token, location.pathname, dispatch, navigate]);

  return <>{children}</>;
};

export default AuthGuard;
