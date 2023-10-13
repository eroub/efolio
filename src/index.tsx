import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "styled-components";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import GlobalStyle from "./assets/GlobalStyle";
import { useAppColorScheme } from "./hooks/useAppColorScheme";
import { lightTheme, darkTheme } from "./assets/themes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const RootComponent = () => {
  const colorScheme = useAppColorScheme(); // Use your custom hook

  return (
    <React.StrictMode>
      <ThemeProvider theme={colorScheme === "light" ? lightTheme : darkTheme}>
        <GlobalStyle theme={colorScheme === "light" ? lightTheme : darkTheme} />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

root.render(<RootComponent />);
