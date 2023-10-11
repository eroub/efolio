import { createGlobalStyle } from "styled-components";
import { Theme } from "./themes";

// Use the Theme type to define the prop type
const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    background-color: ${({ theme }) => theme.bodyBackgroundColor};
    color: ${({ theme }) => theme.textColor};
  }

  svg text {
    color: ${({ theme }) => theme.textColor};
  }

  tr {
    background-color: ${({ theme }) => theme.tableRowColor};
  }

  tr > td {
    color: ${({ theme }) => theme.textColor};
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`;

export default GlobalStyle;
