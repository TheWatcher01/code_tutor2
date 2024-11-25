// File path: code_tutor2/frontend/src/hooks/use-mobile.jsx

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Configuration initiale
    handleResize();

    // Ajout des listeners
    mql.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);

    // Nettoyage
    return () => {
      mql.removeEventListener("change", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};
