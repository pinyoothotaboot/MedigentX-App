
import React from 'react';

interface PasswordStrengthIndicatorProps {
  strength: number; // 0-5 scale
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const getWidthPercentage = () => {
    return (strength / 5) * 100;
  };

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
        <span className={`text-xs font-medium ${
          strength <= 1 ? 'text-red-600' :
          strength === 2 ? 'text-orange-600' :
          strength === 3 ? 'text-yellow-600' :
          strength === 4 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`}
          style={{ width: `${getWidthPercentage()}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>Password should include:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li className={strength >= 1 ? 'text-green-600' : ''}>At least 8 characters</li>
          <li className={strength >= 2 ? 'text-green-600' : ''}>Lowercase letters</li>
          <li className={strength >= 3 ? 'text-green-600' : ''}>Uppercase letters</li>
          <li className={strength >= 4 ? 'text-green-600' : ''}>Numbers</li>
          <li className={strength >= 5 ? 'text-green-600' : ''}>Special characters</li>
        </ul>
      </div>
    </div>
  );
};
