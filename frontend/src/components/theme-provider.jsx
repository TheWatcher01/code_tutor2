// File path: code_tutor2/frontend/src/components/theme-provider.jsx

import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { themes, initialThemeState } from "@/constants/themes";

// Create theme context provider
const ThemeContext = createContext(initialThemeState);

function ThemeProvider({
  children,
  defaultTheme = themes.system,
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(themes.light, themes.dark);

    if (theme === themes.system) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? themes.dark
        : themes.light;
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Props validation for ThemeProvider
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.oneOf(Object.values(themes)),
  storageKey: PropTypes.string,
};

// Export components only
export { ThemeContext, ThemeProvider };
