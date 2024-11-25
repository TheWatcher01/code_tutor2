// File path: code_tutor2/frontend/src/hooks/useAuth.jsx

import { useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts";
import authService from "@/services/auth.service";
import logger from "@/services/frontendLogger";
import { useToast } from "@/hooks/use-toast";

const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, error, setUser, setError } = useContext(AuthContext);

  // Handle GitHub authentication
  const loginWithGithub = useCallback(() => {
    try {
      logger.info("useAuth", "Initiating GitHub login");
      authService.initiateGithubAuth();
    } catch (error) {
      logger.error("useAuth", "GitHub login failed", error);
      toast({
        title: "Authentication Error",
        description: "Failed to initiate GitHub login. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle logout
  const logout = useCallback(async () => {
    try {
      logger.info("useAuth", "Initiating logout");
      await authService.logout();
      setUser(null);

      toast({
        title: "Logout Successful",
        description: "You have been logged out successfully.",
      });

      navigate("/");
    } catch (error) {
      logger.error("useAuth", "Logout failed", error);
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, setUser, toast]);

  // Verify authentication status
  const checkAuth = useCallback(async () => {
    try {
      logger.debug("useAuth", "Checking authentication status");
      const { isAuthenticated, user: userData } =
        await authService.checkAuthStatus();

      if (isAuthenticated && userData) {
        logger.info("useAuth", "User authenticated", { userId: userData.id });
        setUser(userData);
        return true;
      }

      logger.info("useAuth", "User not authenticated");
      setUser(null);
      return false;
    } catch (error) {
      logger.error("useAuth", "Auth check failed", error);
      setError("Failed to verify authentication status");
      setUser(null);
      return false;
    }
  }, [setUser, setError]);

  // Handle authentication errors
  const handleAuthError = useCallback(
    (error) => {
      const { error: errorMessage, status } =
        authService.handleAuthError(error);

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (status === 401) {
        navigate("/");
      }
    },
    [navigate, toast]
  );

  // Get redirect path after authentication
  const getRedirectPath = useCallback(() => {
    return authService.getRedirectPath();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGithub,
    logout,
    checkAuth,
    handleAuthError,
    getRedirectPath,
  };
};

export default useAuth;
