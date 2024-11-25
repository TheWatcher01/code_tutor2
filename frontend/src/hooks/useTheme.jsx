// File path: code_tutor2/frontend/src/hooks/useTheme.jsx

import { useContext } from "react";
import { ThemeContext } from "@/components/theme-provider"
import { themes } from "@/constants/themes";

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return {
    ...context,
    themes,
  };
}

export default useTheme;