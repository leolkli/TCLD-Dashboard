import { useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useAuthStore } from '@/store/authStore';
import { loginRequest } from '@/config/authConfig';

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const useAuth = () => {
  const { instance, inProgress, accounts } = useMsal();
  const msalIsAuthenticated = useIsAuthenticated();
  
  // Zustand store
  const { user, isLoading, error, setUser, setLoading, setError, clearAuth } = useAuthStore();
  
  // Determine effective auth state
  // In mock mode, we rely on the zustand store 'user' being present to mean 'authenticated'
  // But for hooks consistency we need a boolean
  const isAuthenticated = USE_MOCK_AUTH ? !!user : msalIsAuthenticated;
  const isInteracting = !USE_MOCK_AUTH && inProgress !== InteractionStatus.None;

  const login = useCallback(async () => {
    if (USE_MOCK_AUTH) {
        setLoading(true);
        console.log('Mock login initiated...');
        // Simulate API delay
        setTimeout(() => {
          const mockUser = {
            id: 'mock-user-123',
            email: 'mock@tcld.com',
            name: 'Mock Developer',
            roles: ['admin'], // Full access for dev
            assignedBuildings: [],
          };
          setUser(mockUser as any);
          setLoading(false);
          console.log('Mock login complete');
        }, 500);
        return;
    }

    try {
      await instance.loginRedirect(loginRequest);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
    }
  }, [USE_MOCK_AUTH, instance, setError, setUser, setLoading]);

  const logout = useCallback(() => {
    if (USE_MOCK_AUTH) {
      clearAuth();
      return;
    }
    
    clearAuth();
    instance.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  }, [USE_MOCK_AUTH, instance, clearAuth]);

  // Provision user (Real mode only)
  useEffect(() => {
    if (USE_MOCK_AUTH) return;

    const initializeUser = async () => {
      if (!isAuthenticated || isInteracting) return;
      if (user) return;

      setLoading(true);
      try {
        // Build user object from account info first to prevent UI flicker
        const account = accounts[0];
        const initialUser = {
            id: account?.localAccountId || 'unknown',
            name: account?.name || 'User',
            email: account?.username || '',
            roles: [],
            assignedBuildings: []
        };
        
        // Try to fetch roles from API
        try {
            // const userData = await userService.getCurrentUser();
            // setUser(userData);
            // Verify if API is actually implemented or mocks needed
             setUser(initialUser as any); 
        } catch (apiError) {
             console.warn('API user fetch failed, using basic account info', apiError);
             setUser(initialUser as any);
        }
      } catch (err: any) {
         console.error('User initialization error:', err);
         setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [isAuthenticated, isInteracting, user, setUser, setLoading, setError, accounts]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isInteracting,
    error,
    login,
    logout,
    account: USE_MOCK_AUTH ? { name: 'Mock User', username: 'mock@tcld.com' } : accounts[0],
    isMock: USE_MOCK_AUTH
  };
};

export default useAuth;
