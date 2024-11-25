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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const { user, loading, error, setUser, checkAuth } = context;

  const loginWithGithub = useCallback(() => {
    try {
      logger.info("useAuth", "Starting GitHub auth");
      authService.initiateGithubAuth();
    } catch (error) {
      logger.error("useAuth", "GitHub auth failed", error);
      toast({
        title: "Authentication Error",
        description: "GitHub login failed. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate("/");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      logger.error("useAuth", "Logout failed", error);
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  }, [navigate, setUser, toast]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGithub,
    logout,
    checkAuth,
  };
};

export default useAuth;
