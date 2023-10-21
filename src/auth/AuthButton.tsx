// AuthButton.tsx
import React from "react";
import { useAuth } from "./AuthContext";
import http from "../services/http"; // Import the Axios configuration

const AuthButton: React.FC = () => {
  const { auth, authenticate } = useAuth();

  const handleAuthenticate = async () => {
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

    try {
      const response = await http.post("/auth", {
        username,
        password,
      });

      if (response.status === 200) {
        alert("Authenticated successfully");
        const token = response.data.token;
        authenticate(token); // Store token instead of username and password
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        alert("Authentication failed");
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
