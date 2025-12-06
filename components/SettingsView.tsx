
import React from 'react';
import { Settings } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-medical-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400">
            Settings configuration will be available here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
