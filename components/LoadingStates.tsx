
import React from 'react';
import { Loader2, FileText, User, MessageSquare, Stethoscope } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={`animate-spin text-medical-500 ${sizeClasses[size]} ${className}`} 
    />
  );
};

interface LoadingStateProps {
  type?: 'general' | 'patients' | 'notes' | 'chat' | 'ai';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'general',
  message,
  size = 'md',
  fullScreen = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'patients':
        return <User className="w-8 h-8 text-medical-400" />;
      case 'notes':
        return <FileText className="w-8 h-8 text-medical-400" />;
      case 'chat':
        return <MessageSquare className="w-8 h-8 text-medical-400" />;
      case 'ai':
        return <Stethoscope className="w-8 h-8 text-medical-400" />;
      default:
        return <LoadingSpinner size="lg" />;
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (type) {
      case 'patients':
        return 'Loading patient data...';
      case 'notes':
        return 'Loading medical notes...';
      case 'chat':
        return 'Connecting to AI assistant...';
      case 'ai':
        return 'AI is thinking...';
      default:
        return 'Loading...';
    }
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white dark:bg-slate-900 bg-opacity-75 dark:bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        <p className="text-medical-600 dark:text-medical-400 text-sm font-medium">
          {getMessage()}
        </p>
      </div>
    </div>
  );
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = false
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`
        bg-gray-200 dark:bg-slate-700 animate-pulse
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={style}
    />
  );
};

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  type?: LoadingStateProps['type'];
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message,
  type = 'general'
}) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <LoadingState type={type} message={message} />
    </div>
  );
};
