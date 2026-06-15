import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { configureAuth } from '../api/axios';
import * as authApi from '../api/auth';
import { decodeToken } from '../utils/formatters';

export const AuthContext = createContext(null);

function buildUserFromToken(token, email, name) {
  const payload = decodeToken(token);
  if (!payload) return null;
  return {
    id: payload.userId,
    email: email || '',
    name: name || email?.split('@')[0] || 'User',
    roles: payload.roles || ['USER'],
  };
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAccessToken = useCallback((token) => {
    setAccessTokenState(token);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessTokenState(null);
    setUser(null);
  }, []);

  const applyAuthResponse = useCallback(async (responseData, fallbackName) => {
    const token = responseData.accessToken;
    const email = responseData.email || responseData.user?.email;
    setAccessTokenState(token);

    let resolvedUser = buildUserFromToken(token, email, fallbackName || responseData.user?.name);

    if (resolvedUser?.id && token) {
      try {
        const profile = await authApi.fetchUser(resolvedUser.id, token);
        resolvedUser = {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email,
          roles: resolvedUser.roles,
        };
      } catch {
        // Use token-derived user if profile fetch fails
      }
    }

    setUser(resolvedUser);
    return resolvedUser;
  }, []);

  useEffect(() => {
    configureAuth({
      getToken: () => accessToken,
      setToken: setAccessToken,
      logout: clearAuth,
    });
  }, [accessToken, setAccessToken, clearAuth]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await authApi.refreshToken();
        if (!cancelled) {
          await applyAuthResponse(response.data);
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [applyAuthResponse, clearAuth]);

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials);
      await applyAuthResponse(response.data);
      return response;
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload) => {
      const response = await authApi.register(payload);
      await applyAuthResponse(response.data, payload.name);
      return response;
    },
    [applyAuthResponse]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local state even if logout API fails
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      login,
      register,
      logout,
      applyAuthResponse,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
    }),
    [user, accessToken, login, register, logout, applyAuthResponse, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
