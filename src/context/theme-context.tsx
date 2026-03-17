import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: (_: "light" | "dark") => {},
  toggleTheme: () => {},
});

export const ThemeProviderCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeController = () => useContext(ThemeContext);
