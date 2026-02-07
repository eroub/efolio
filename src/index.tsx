import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import GlobalStyle from "./assets/GlobalStyle";
import { useAppColorScheme } from "./hooks/useAppColorScheme";
import { lightTheme, darkTheme } from "./assets/themes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const RootComponent = () => {
  const colorScheme = useAppColorScheme();

  return (
    <React.StrictMode>
      <ThemeProvider theme={colorScheme === "light" ? lightTheme : darkTheme}>
        <GlobalStyle theme={colorScheme === "light" ? lightTheme : darkTheme} />
        <AuthProvider>
          <Router>
            <App />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

// Crash guard: if something throws during initial render, show it instead of a blank screen.
try {
  root.render(<RootComponent />);
} catch (e: any) {
  const msg = e?.message || String(e);
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.style.padding = "16px";
  pre.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace";
  pre.textContent = `BOOT_RENDER_ERROR\n\n${msg}`;
  document.body.innerHTML = "";
  document.body.appendChild(pre);
  // eslint-disable-next-line no-console
  console.error("BOOT_RENDER_ERROR", e);
}

