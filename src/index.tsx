import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AppSessionProvider } from '../shared/session/AppSessionContext';
import './styles/index.css';
import '../auth/src/styles/index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppSessionProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </Router>
    </AppSessionProvider>
  </React.StrictMode>
);
