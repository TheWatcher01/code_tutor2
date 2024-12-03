// File path: frontend/src/hooks/useAuth.jsx

import { useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts";
import { useAuthLogout } from "@/api/hooks/useAuth.api";
import logger from "@/services/frontendLogger";

const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const { trigger: logout } = useAuthLogout();

  if (!context) {
    logger.error("useAuth", "Hook used outside AuthProvider");
    throw new Error("useAuth must be used within AuthProvider");
  }

  const loginWithGithub = useCallback(() => {
    logger.info("useAuth", "Initiating GitHub login");
    window.location.replace(
      `${import.meta.env.VITE_API_URL}/auth/github/callback`
    );
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      context.revalidate(); // Force revalidation of auth status
      navigate("/");
    } catch (error) {
      logger.error("useAuth", "Logout failed", { error });
    }
  }, [logout, context, navigate]);

  return {
    ...context,
    loginWithGithub,
    logout: handleLogout,
  };
};

export default useAuth;
