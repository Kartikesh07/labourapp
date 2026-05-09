import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api/auth';
import { LoginPayload, RegisterPayload } from '../types';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const { t } = useTranslation();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: any) => {
    if (err.response?.data?.code) {
      return t(`errors.${err.response.data.code}` as any, { defaultValue: err.response.data.message });
    }
    if (err.response?.data?.message) return err.response.data.message;
    return err.message || t('errors.DEFAULT');
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      if (response.success && response.data) {
        await setAuth(response.data.user, response.data.session);
        return true;
      } else {
        setError(response.message || t('errors.DEFAULT'));
        return false;
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(payload);
      if (response.success && response.data) {
        await setAuth(response.data.user, response.data.session);
        return true;
      } else {
        setError(response.message || t('errors.DEFAULT'));
        return false;
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (e) {
      // Best-effort logout
    } finally {
      await clearAuth();
      setIsLoading(false);
    }
  };

  return { login, register, logout, isLoading, error, user, isAuthenticated, clearError: () => setError(null) };
};
