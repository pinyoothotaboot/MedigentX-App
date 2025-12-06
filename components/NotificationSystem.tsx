
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeNotification } from '../store/appSlice';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationSystem: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.app.notifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-medical-500" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      default:
        return 'border-medical-200 bg-medical-50 text-medical-800 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-300';
    }
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoRemove) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto
            flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm
            transform transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right-5
            ${getNotificationStyles(notification.type)}
          `}
        >
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
            )}
            <p className="text-sm">{notification.message}</p>
          </div>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
