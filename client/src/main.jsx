import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CRMProvider>
          <App />
        </CRMProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
