import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

import App from './App';
import { theme } from './theme';
import { msalConfig } from '@/config/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as any;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

// Async initialization to prevent blank page
msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={App} />
          </ThemeProvider>
        
      </MsalProvider>
    </React.StrictMode>
  );
});
