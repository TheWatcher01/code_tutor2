// File path: code_tutor2/frontend/src/constants/themes.js

// Available theme options
export const themes = {
  dark: "dark",
  light: "light", 
  system: "system",
};

// Initial theme context state
export const initialThemeState = {
  theme: themes.system,
  setTheme: () => null,
};
