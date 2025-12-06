import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './components/AppRouter';
import AuthProvider from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;