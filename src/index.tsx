import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Import AuthProvider to wrap entire App with
import { AuthProvider } from "./auth/AuthContext";
// Import GlobalStyles to standardize styling across the app
import GlobalStyle from "./assets/GlobalStyle";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
