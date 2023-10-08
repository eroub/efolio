// AuthButton.tsx
import React from "react";
import { useAuth } from "./AuthContext";
import http from "../services/http"; // Import the Axios configuration

const AuthButton: React.FC = () => {
  const { auth, authenticate } = useAuth();

  const handleAuthenticate = async () => {
    // Check if already authenticated
    if (auth.isAuthenticated) {
      alert("Already authenticated");
      return;
    }

    const username = prompt("Enter username");
    const password = prompt("Enter password");

    if (!username || !password) {
      alert("Both username and password are required.");
      return;
    }

    const base64Credentials = btoa(username + ":" + password);

    try {
      const response = await http.get("/auth", {
        headers: { Authorization: `Basic ${base64Credentials}` },
      });

      if (response.status === 200) {
        alert("Authenticated successfully");
        authenticate(username, password);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response.status === 401) {
          alert("Authentication failed");
        } else {
          alert("A network error occurred during authentication");
        }
      } else {
        alert("A network error occurred during authentication");
      }
    }
  };

  return !auth.isAuthenticated ? (
    <button onClick={handleAuthenticate}>Authenticate</button>
  ) : null;
};

export default AuthButton;
