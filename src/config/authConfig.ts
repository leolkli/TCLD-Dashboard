import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL Configuration for Microsoft Entra ID Authentication
 * Replace these values with your Azure AD App Registration details
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '089bfdc6-4a5d-4782-9915-aa338a447d92',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'ae326a90-5548-4db0-a52c-9b8e317c2010'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

/**
 * Scopes for API access
 */
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

/**
 * API scopes for backend calls
 */
export const apiRequest = {
  scopes: [
    `api://${import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id'}/access_as_user`,
  ],
};
