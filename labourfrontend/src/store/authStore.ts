import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserProfile, Session } from '../types';

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  setAuth: (user: UserProfile, session: Session) => Promise<void>;
  setUser: (user: UserProfile) => void;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setAuth: async (user: UserProfile, session: Session) => {
    try {
      await SecureStore.setItemAsync('access_token', session.access_token);
      await SecureStore.setItemAsync('refresh_token', session.refresh_token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist auth:', e);
    }
    set({ user, session, isAuthenticated: true, isLoading: false });
  },

  setUser: (user: UserProfile) => {
    set({ user });
    SecureStore.setItemAsync('user', JSON.stringify(user)).catch(() => {});
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user');
    } catch (e) {
      console.warn('Failed to clear auth:', e);
    }
    set({ user: null, session: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        SecureStore.getItemAsync('refresh_token'),
        SecureStore.getItemAsync('user'),
      ]);

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr) as UserProfile;
        const session: Session = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          token_type: 'bearer',
        };
        set({ user, session, isAuthenticated: true, isLoading: false, isHydrated: true });
      } else {
        set({ isLoading: false, isHydrated: true });
      }
    } catch (e) {
      console.warn('Hydration failed:', e);
      set({ isLoading: false, isHydrated: true });
    }
  },
}));
