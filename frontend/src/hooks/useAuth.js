// File path: frontend/src/hooks/useAuth.js

import { useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts";
import { useAuthLogout } from "@/api/hooks/useAuth.api";
import logger from "@/services/frontendLogger";

const useAuth = () => {
  // Access the authentication context to retrieve user information and authentication status
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const { trigger: logout } = useAuthLogout();

  // Store the API URL in a ref to prevent unnecessary re-renders
  const apiUrlRef = useRef(import.meta.env.VITE_API_URL);

  // Ensure the hook is used within the AuthProvider context
  if (!context) {
    logger.error("useAuth", "Hook used outside AuthProvider");
    throw new Error("useAuth must be used within AuthProvider");
  }

  // Function to initiate login with GitHub
  const loginWithGithub = useCallback(() => {
    logger.info("useAuth", "Initiating GitHub login", {
      redirectUrl: `${apiUrlRef.current}/auth/github`,
    });

    // Redirect the user to the GitHub authentication page
    window.location.replace(`${apiUrlRef.current}/auth/github`);
  }, []);

  // Function to handle user logout
  const handleLogout = useCallback(async () => {
    try {
      logger.info("useAuth", "Initiating logout");
      await logout();

      // Revalidate authentication status only after a successful logout
      await context.revalidate();

      logger.info("useAuth", "Logout successful, redirecting");
      navigate("/", { replace: true });
    } catch (error) {
      logger.error("useAuth", "Logout failed", {
        error: error.message,
        stack: error.stack,
      });

      // Optionally handle error (e.g., show a toast notification)
    }
  }, [logout, context, navigate]);

  // Return user information and authentication methods
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    loginWithGithub,
    logout: handleLogout,
  };
};

export default useAuth;
