import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import App from "./App";
// Import AuthProvider to wrap entire App with
import { AuthProvider } from "./auth/AuthContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
