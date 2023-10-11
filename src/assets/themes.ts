// themes.ts
export type Theme = {
  bodyBackgroundColor: string;
  textColor: string;
  tableRowColor: string;
};

export const darkTheme: Theme = {
  bodyBackgroundColor: "#403F3B",
  textColor: "#E6E3D3",
  tableRowColor: "#504E49",
};

export const lightTheme: Theme = {
  bodyBackgroundColor: "white",
  textColor: "black",
  tableRowColor: "yourLightModeColor",
};
