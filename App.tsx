
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './components/AppRouter';
import AuthProvider from './components/AuthProvider';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Provider>
  );
};

export default App;