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
window.addEventListener("error", (ev: any) => {
  try {
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.padding = "16px";
    pre.style.fontFamily =
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace";
    pre.textContent = `WINDOW_ERROR\n\n${String(ev?.message || ev?.error?.message || ev)}`;
    document.body.innerHTML = "";
    document.body.appendChild(pre);
  } catch {}
});

window.addEventListener("unhandledrejection", (ev: any) => {
  try {
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.padding = "16px";
    pre.style.fontFamily =
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace";
    pre.textContent = `UNHANDLED_REJECTION\n\n${String(ev?.reason?.message || ev?.reason || ev)}`;
    document.body.innerHTML = "";
    document.body.appendChild(pre);
  } catch {}
});

root.render(<RootComponent />);

