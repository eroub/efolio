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

  // Apply the common styles for background and border colors
  &&.MuiPaper-root, &&.MuiGrid-root, &&.MuiGrid-item, .MuiAccordion-root, &&.MuiFormControl-root {
    background-color: ${({ theme }) =>
      theme.containerBackgroundColor} !important;
    border-color: ${({ theme }) => theme.containerBorderColor} !important;
  }

  // Apply the common styles for text color
  .MuiAccordion-root, &&.MuiSvgIcon-root, &&.MuiButtonBase-root, &&.MuiMenuItem-root, &&.MuiTypography-root, &&.MuiInputLabel-root, &&.MuiInputBase-input, &&.MuiFormLabel-root, &&.MuiOutlinedInput-root {
    color: ${({ theme }) => theme.formTextColor} !important;
  }

  // Special case for the outline color
  &&.MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.formTextColor} !important;
  }

`;

export default GlobalStyle;
