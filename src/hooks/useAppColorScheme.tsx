import { useState, useEffect } from "react";

export const useAppColorScheme = () => {
  const [colorScheme, setColorScheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return colorScheme;
};

export const useCurrentTheme = (): "dark" | "light" => {
  const colorScheme = useAppColorScheme();
  return colorScheme === "dark" ? "dark" : "light";
};
