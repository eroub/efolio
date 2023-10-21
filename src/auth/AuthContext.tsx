// AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// const ONE_DAY = 24 * 60 * 60 * 1000; // in milliseconds

interface AuthContextProps {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
  authenticate: (token: string) => void;
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
    token: string | null;
  }>(() => {
    const token = localStorage.getItem("authToken");
    return { isAuthenticated: !!token, token };
  });

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem("authToken", auth.token);
    }
  }, [auth]);

  const authenticate = (token: string) => {
    setAuth({ isAuthenticated: true, token });
  };

  const value = { auth, authenticate };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
