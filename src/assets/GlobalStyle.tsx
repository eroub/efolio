import { createGlobalStyle } from "styled-components";
import useAppColorScheme from "../hooks/useAppColorScheme";

const GlobalStyle = createGlobalStyle<{ colorScheme: string }>`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: white;
    color: black;

    background-color: ${({ colorScheme }) =>
      colorScheme === "dark" ? "#403F3B" : "white"};
    color: ${({ colorScheme }) =>
      colorScheme === "dark" ? "#E6E3D3" : "black"};
  }

  svg text {
    color: ${({ colorScheme }) =>
      colorScheme === "dark" ? "#E6E3D3" : "black"};
  }

  tr {
    background-color: ${({ colorScheme }) =>
      colorScheme === "dark" ? "#504E49" : "yourLightModeColor"};
  }

  tr > td {
    color: ${({ colorScheme }) =>
      colorScheme === "dark" ? "#E6E3D3" : "yourLightModeColor"};
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
  }
`;

const AppGlobalStyle = () => {
  const colorScheme = useAppColorScheme(); // Use the custom hook
  return <GlobalStyle colorScheme={colorScheme} />;
};

export default AppGlobalStyle;
