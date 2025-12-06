
import React from 'react';
import { Database } from 'lucide-react';

export const EHRIntegration: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-gray-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">EHR Integration Status</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Demo Mode: Integrated with Sandbox Environment.
      </p>
    </div>
  );
};
