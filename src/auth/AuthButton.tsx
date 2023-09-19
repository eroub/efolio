// AuthButton.tsx
import React from "react";
import { useAuth } from "./AuthContext";

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
      const response = await fetch("/auth", {
        method: "GET",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      });

      if (response.status === 200) {
        alert("Authenticated successfully");
        authenticate(username, password);
      } else {
        alert("Authentication failed");
      }
    } catch (error) {
      alert("An error occurred during authentication");
    }
  };

  return <button onClick={handleAuthenticate}>Authenticate</button>;
};

export default AuthButton;
