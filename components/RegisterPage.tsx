
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearError } from '../store/authSlice';
import { Eye, EyeOff, Mail, Lock, User, Stethoscope, UserPlus } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { SocialLoginButton } from './SocialLoginButton';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    specialty: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const specialties = [
    'General Practitioner',
    'Internal Medicine',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Psychiatry',
    'Emergency Medicine',
    'Surgery',
    'Radiology',
    'Anesthesiology',
    'Other'
  ];

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    return strength;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength < 3) {
      errors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters.';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      specialty: formData.specialty
    };

    dispatch(registerUser(userData));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Calculate password strength when password changes
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSocialRegister = (provider: 'google' | 'facebook') => {
    console.log(`Register with ${provider}`);
    // Implement social registration logic here
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-medical-100 dark:bg-medical-900/30 rounded-lg flex items-center justify-center">
              <UserPlus size={24} className="text-medical-600 dark:text-medical-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Join MediGentX
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start your secure practice today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                    formErrors.firstName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-medical-500 focus:ring-medical-500/20'
                  } focus:outline-none focus:ring-3`}
                  placeholder="John"
                  disabled={loading}
                />
              </div>
              {formErrors.firstName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  formErrors.lastName 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-medical-500 focus:ring-medical-500/20'
                } focus:outline-none focus:ring-3`}
                placeholder="Smith"
                disabled={loading}
              />
              {formErrors.lastName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  formErrors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-medical-500 focus:ring-medical-500/20'
                } focus:outline-none focus:ring-3`}
                placeholder="doctor@hospital.com"
                disabled={loading}
              />
            </div>
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  formErrors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-medical-500 focus:ring-medical-500/20'
                } focus:outline-none focus:ring-3`}
                placeholder="Create a strong password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye size={18} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {formData.password && <PasswordStrengthIndicator strength={passwordStrength} />}
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  formErrors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-medical-500 focus:ring-medical-500/20'
                } focus:outline-none focus:ring-3`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye size={18} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Specialty Field */}
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medical Specialty
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 focus:outline-none focus:ring-3 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select your specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="/terms" className="text-medical-600 hover:text-medical-700 dark:text-medical-400 dark:hover:text-medical-300">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-medical-600 hover:text-medical-700 dark:text-medical-400 dark:hover:text-medical-300">
                Privacy Policy
              </a>
            </label>
          </div>
          {formErrors.agreeToTerms && (
            <p className="text-sm text-red-600 dark:text-red-400">{formErrors.agreeToTerms}</p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-medical-600 hover:bg-medical-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-medical-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={18} className="mr-2" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Social Registration */}
        <div className="space-y-3">
          <SocialLoginButton 
            provider="google" 
            onClick={() => handleSocialRegister('google')}
            disabled={loading}
          />
          <SocialLoginButton 
            provider="facebook" 
            onClick={() => handleSocialRegister('facebook')}
            disabled={loading}
          />
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-medical-600 hover:text-medical-700 dark:text-medical-400 dark:hover:text-medical-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
