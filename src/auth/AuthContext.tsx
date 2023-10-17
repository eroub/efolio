// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

const ONE_DAY = 24 * 60 * 60 * 1000; // in milliseconds

interface AuthContextProps {
  auth: {
    isAuthenticated: boolean;
    credentials: { username: string; password: string } | null;
  };
  authenticate: (username: string, password: string) => void;
  getEncodedCredentials: () => string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; credentials: { username: string; password: string } | null; }>(
    () => {
      const savedAuth = localStorage.getItem('auth');
      const expiryTimeString = localStorage.getItem('authExpiry');
      const expiryTime = expiryTimeString ? new Date(Number(expiryTimeString)) : null;

      if (savedAuth && expiryTime && new Date().getTime() < Number(expiryTime)) {
        return JSON.parse(savedAuth);
      }
      return { isAuthenticated: false, credentials: null };
    }
  );

  useEffect(() => {
    if (auth.isAuthenticated) {
      const expiryTime = new Date().getTime() + ONE_DAY;
      localStorage.setItem('auth', JSON.stringify(auth));
      localStorage.setItem('authExpiry', expiryTime.toString());
    }
  }, [auth]);

  const authenticate = (username: string, password: string) => {
    const newAuth = {
      isAuthenticated: true,
      credentials: { username, password },
    };
    setAuth(newAuth);
  };

  const getEncodedCredentials = () => {
    if (auth.isAuthenticated && auth.credentials) {
      const { username, password } = auth.credentials;
      return btoa(`${username}:${password}`);
    }
    return null;
  };

  const value = {
    auth,
    authenticate,
    getEncodedCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
