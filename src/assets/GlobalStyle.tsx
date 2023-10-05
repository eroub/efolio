import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: white;
    color: black;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background-color: #403F3B;
      color: #E6E3D3; // Cream
    }
    tr {
      background-color: #504E49;  // Existing background color
    }

    tr > td {
      color: #E6E3D3;  // Text color as in the dark color scheme
    }
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
  }
`;

export default GlobalStyle;
