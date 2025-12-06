
import React, { useState } from 'react';
import { Menu, X, Home, MessageSquare, FileText, Settings, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentView } from '../store/appSlice';
import SearchBar from './SearchBar';

export const MobileNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentView } = useAppSelector(state => state.app);
  const dispatch = useAppDispatch();

  const navigationItems = [
    { key: 'welcome', icon: Home, label: 'Home' },
    { key: 'chat', icon: MessageSquare, label: 'Chat' },
    { key: 'note', icon: FileText, label: 'Notes' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigation = (view: any) => {
    dispatch(setCurrentView(view));
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isMenuOpen ? <X size={24} className="text-gray-600 dark:text-gray-300" /> : <Menu size={24} className="text-gray-600 dark:text-gray-300" />}
          </button>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            MediGentX
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <Search size={20} className="text-gray-600 dark:text-gray-300" />
          </button> */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="w-80 max-w-[80vw] bg-white dark:bg-slate-800 h-full shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Menu Header */}
            <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">MediGentX</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <SearchBar onResultSelect={() => setIsMenuOpen(false)} />
            </div>

            {/* Navigation Items */}
            <nav className="py-4">
              {navigationItems.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleNavigation(key)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${currentView === key
                      ? 'bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 border-r-2 border-medical-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                AI-Powered Medical Assistant
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
