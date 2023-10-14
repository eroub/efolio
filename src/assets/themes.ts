// themes.ts
type BaseColors = {
  black: string;
  "950": string;
  "900": string;
  "850": string;
  "800": string;
  "700": string;
  "600": string;
  "500": string;
  "300": string;
  "200": string;
  "150": string;
  "100": string;
  "50": string;
  paper: string;
};

type DarkLightColors = {
  red: string;
  orange: string;
  yellow: string;
  green: string;
  cyan: string;
  blue: string;
  purple: string;
  magenta: string;
  darkyellow: string;
  darkorange: string;
  darkblue: string;
};

export type ColorSchemeType = {
  base: BaseColors;
  dark: DarkLightColors;
  light: DarkLightColors;
};

export const colorScheme: ColorSchemeType = {
  base: {
    black: "#100F0F",
    "950": "#1C1B1A",
    "900": "#282726",
    "850": "#343331",
    "800": "#403E3C",
    "700": "#575653",
    "600": "#6F6E69",
    "500": "#878580",
    "300": "#B7B5AC",
    "200": "#CECDC3",
    "150": "#DAD8CE",
    "100": "#E6E4D9",
    "50": "#F2F0E5",
    paper: "#FFFCF0",
  },
  dark: {
    red: "#AF3029",
    orange: "#BC5215",
    yellow: "#AD8301",
    green: "#66800B",
    cyan: "#24837B",
    blue: "#205EA6",
    purple: "#5E409D",
    magenta: "#A02F6F",
    darkyellow: "#8D6B00",
    darkorange: "#993D00",
    darkblue: "#003877",
  },
  light: {
    red: "#D14D41",
    orange: "#DA702C",
    yellow: "#D0A215",
    green: "#879A39",
    cyan: "#3AA99F",
    blue: "#4385BE",
    purple: "#8B7EC8",
    magenta: "#CE5D97",
    darkyellow: "#DAB017",
    darkorange: "#E16812",
    darkblue: "#3269B5",
  },
};

export type Theme = {
  bodyBackgroundColor: string;
  textColor: string;
  tableRowColor: string;
  formBackgroundColor: string;
  formTextColor: string;
  accordionBackgroundColor: string;
  accordionTextColor: string;
  containerBackgroundColor: string;
  containerBorderColor: string;
};

export const darkTheme: Theme = {
  bodyBackgroundColor: colorScheme.base["850"],
  textColor: colorScheme.base["100"],
  tableRowColor: colorScheme.base["700"],
  formBackgroundColor: colorScheme.base["850"],
  formTextColor: colorScheme.base["100"],
  accordionBackgroundColor: colorScheme.base["700"],
  accordionTextColor: colorScheme.base["100"],
  containerBackgroundColor: colorScheme.base["850"],
  containerBorderColor: colorScheme.base["700"],
};

export const lightTheme: Theme = {
  bodyBackgroundColor: colorScheme.base["50"],
  textColor: colorScheme.base["900"],
  tableRowColor: colorScheme.base["300"],
  formBackgroundColor: colorScheme.base["200"],
  formTextColor: colorScheme.base["900"],
  accordionBackgroundColor: colorScheme.base["300"],
  accordionTextColor: colorScheme.base["900"],
  containerBackgroundColor: colorScheme.base["50"],
  containerBorderColor: colorScheme.base["200"],
};
