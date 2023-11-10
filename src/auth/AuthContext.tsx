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

// Function to check if the token is expired
function isTokenExpired(token: string) {
  const decoded: any = jwtDecode(token);
  return decoded.exp < Date.now() / 1000;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<{
    isAuthenticated: boolean;
    token: string | null;
  }>(() => {
    const token = localStorage.getItem("authToken");
    const isAuthenticated = token ? !isTokenExpired(token) : false;
    return { isAuthenticated, token };
  });
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  // Logout user function
  const logoutUser = () => {
    localStorage.removeItem("authToken");
    setAuth({ isAuthenticated: false, token: null });
  };

  // Check for token expiration immediately on mount and set an interval
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      if (token && isTokenExpired(token)) {
        logoutUser();
      }
    };

    // Check immediately
    checkAuthStatus();

    // Set interval to check periodically
    const interval = setInterval(checkAuthStatus, 180000);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const authenticate = (token: string) => {
    if (!isTokenExpired(token)) {
      localStorage.setItem("authToken", token);
      setAuth({ isAuthenticated: true, token });
    } else {
      logoutUser();
    }
  };

  useEffect(() => {
    const fetchAccountsAndSetInitial = async () => {
      try {
        if (auth.isAuthenticated) {
          const response = await http.get("/api/users/get-accounts");
          const accounts = response.data;
          if (accounts.length > 0 && selectedAccount === null) {
            setSelectedAccount(accounts[0].accountID);
          }
        }
      } catch (error: any) {
        console.error(error);
      }
    };

    fetchAccountsAndSetInitial();
    // eslint-disable-next-line
  }, [auth.isAuthenticated]); // Only re-run the effect if auth.isAuthenticated changes

  const value = {
    auth: { ...auth, selectedAccount },
    authenticate,
    setSelectedAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
