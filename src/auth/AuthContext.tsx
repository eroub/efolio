// AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

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
  const [auth, setAuth] = useState<{
    isAuthenticated: boolean;
    credentials: { username: string; password: string } | null;
  }>({ isAuthenticated: false, credentials: null });

  const authenticate = (username: string, password: string) => {
    // Authenticate user here and set state
    setAuth({
      isAuthenticated: true,
      credentials: { username, password },
    });
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
