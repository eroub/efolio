// AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import jwtDecode from "jwt-decode";
import http from "../services/http";

interface AuthContextProps {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
    selectedAccount: number | null;
  };
  authenticate: (token: string) => void;
  setSelectedAccount: React.Dispatch<React.SetStateAction<number | null>>;
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
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem("authToken", auth.token);
    }
  }, [auth]);

  // Function to check if the token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return true;
    const decoded: any = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) return true;
    return false;
  };

  useEffect(() => {
    // Periodic check every 3 minutes
    const interval = setInterval(() => {
      if (isTokenExpired() && auth.isAuthenticated) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("authToken"); // Remove expired token
        setAuth({ isAuthenticated: false, token: null }); // Update the state
      }
    }, 180000); // 180000 milliseconds = 3 minutes
    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, [auth]);

  const authenticate = (token: string) => {
    setAuth({ isAuthenticated: true, token });
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      const fetchAccounts = async () => {
        try {
          // Make sure to include authentication headers
          const response = await http.get("/api/users/get-accounts");
          const accounts = response.data;
          if (accounts.length > 0) {
            setSelectedAccount(accounts[0].accountID);
          }
        } catch (error: any) {
          console.error(error);
        }
      };
      fetchAccounts();
    }
  }, [auth.isAuthenticated]);

  const value = {
    auth: { ...auth, selectedAccount },
    authenticate,
    setSelectedAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
