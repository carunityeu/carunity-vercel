import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '@/api/auth';
import { syncAccountType } from '@/lib/accountType';

const AuthContext = createContext();

// Session state for the whole app, from Supabase Auth. Pages read { user, isAuthenticated,
// isLoadingAuth }; the Base44-era fields (public settings, app errors) stay for compatibility.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const current = await auth.me();
      const resolved = await syncAccountType(current).catch(() => current);
      setUser(resolved);
      setIsAuthenticated(true);
      import('@/lib/referralUtils').then((m) => m.processPendingReferral(current)).catch(() => {});
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    // Sign-in in another tab, token refresh, sign-out: keep the app in step
    return auth.onChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') loadUser();
    });
  }, [loadUser]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => auth.redirectToLogin(window.location.href);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
