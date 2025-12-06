import React from 'react';
import { useAppSelector } from '../store';
import { Sidebar } from './Sidebar';
import PatientBanner from './PatientBanner';
import WelcomeScreen from './WelcomeScreen';
import { ChatInterface } from './ChatInterface';
import NoteEditor from './NoteEditor';
import NewNoteForm from './NewNoteForm';
import NotificationSystem from './NotificationSystem';
import { ThemeToggle } from './ThemeToggle';
import { MobileNavigation } from './MobileNavigation';
import SettingsView from './SettingsView';
import ErrorBoundary from './ErrorBoundary';
import { LoadingOverlay } from './LoadingStates';
import TestSOAPDisplay from './TestSOAPDisplay';
import FinalValidationTest from './FinalValidationTest';
import SettingsTestPage from './SettingsTestPage';
import { useLocalStoragePersistence } from '../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MainLayout: React.FC = () => {
  const { currentView, isLoading } = useAppSelector(state => state.app);
  const { currentPatient } = useAppSelector(state => state.patients);
  const { user } = useAppSelector(state => state.auth);
  const { isMobile } = useBreakpoint();

  // Initialize localStorage persistence
  useLocalStoragePersistence();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const renderMainContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ErrorBoundary>
            {currentPatient ? (
                <ChatInterface 
                    patient={currentPatient} 
                    onUpdateNote={() => {}} 
                    userId={user?.id || 'guest'}
                />
            ) : (
                <WelcomeScreen />
            )}
          </ErrorBoundary>
        );
      case 'note':
        return (
          <ErrorBoundary>
            <NoteEditor />
          </ErrorBoundary>
        );
      case 'newNote':
        return (
          <ErrorBoundary>
            <NewNoteForm />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsView />
          </ErrorBoundary>
        );
      case 'settings-test':
        return (
          <ErrorBoundary>
            <SettingsTestPage />
          </ErrorBoundary>
        );
      case 'test-soap':
        return (
          <ErrorBoundary>
            <TestSOAPDisplay />
          </ErrorBoundary>
        );
      case 'final-validation':
        return (
          <ErrorBoundary>
            <FinalValidationTest />
          </ErrorBoundary>
        );
      case 'welcome':
      default:
        return (
          <ErrorBoundary>
            <WelcomeScreen />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col md:flex-row bg-medical-50 dark:bg-slate-900 relative">
        {/* Global Loading Overlay */}
        <LoadingOverlay show={isLoading} message="Loading application..." />

        {/* Mobile Navigation */}
        {isMobile && <MobileNavigation />}

        {/* Theme Toggle - positioned absolutely in top right */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && (
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Patient Banner - only show when patient is selected */}
          {currentPatient && (
            <ErrorBoundary>
              <PatientBanner />
            </ErrorBoundary>
          )}
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
            {renderMainContent()}
          </div>
        </div>

        {/* Notification System */}
        <NotificationSystem />
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;