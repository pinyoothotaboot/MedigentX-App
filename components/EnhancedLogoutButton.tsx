
import React from 'react';
import { useLogout } from '../hooks/useLogout';
import { LogOut } from 'lucide-react';

export const EnhancedLogoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const logout = useLogout();

  return (
    <button
      onClick={logout}
      className={`flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors ${className}`}
      title="Logout"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
};
