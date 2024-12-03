// File path: code_tutor2/frontend/src/hooks/useAuth.jsx

import { useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts";
import logger from "@/services/frontendLogger";

const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    logger.error("useAuth", "Hook used outside AuthProvider");
    throw new Error("useAuth must be used within AuthProvider");
  }

  const loginWithGithub = useCallback(() => {
    logger.info("useAuth", "Initiating GitHub login");
    window.location.replace(`${import.meta.env.VITE_API_URL}/auth/github/callback`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await context.logout();
      navigate("/");
    } catch (error) {
      logger.error("useAuth", "Logout failed", { error });
    }
  }, [context.logout, navigate]);

  return {
    ...context,
    loginWithGithub,
    logout,
  };
};

export default useAuth;
