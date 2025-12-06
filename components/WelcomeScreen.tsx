
import React from 'react';
import { Activity, FileText, MessageSquare, Settings } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-900 text-center">
      <div className="w-20 h-20 bg-medical-100 dark:bg-medical-900/30 rounded-full flex items-center justify-center mb-6">
        <Activity className="w-10 h-10 text-medical-600 dark:text-medical-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to MediGentX
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        Your AI-powered medical documentation assistant. Select a patient from the sidebar or start a new consultation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Chat</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discuss patient cases and get real-time clinical support.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <FileText className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Notes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate SOAP notes automatically from your conversations.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Settings className="w-8 h-8 text-purple-500 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customizable</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adapt the AI to your specific medical specialty and needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
