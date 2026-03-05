import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles.includes(role) ?? false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user?.roles) return false;
        return roles.some((role) => user.roles.includes(role));
      },

      clearAuth: () => set({ user: null, error: null }),
    }),
    {
      name: 'tcld-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
