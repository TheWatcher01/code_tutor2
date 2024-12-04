// File path: frontend/src/components/auth/GitHubCallback.jsx

import { useEffect, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStatus } from "@/api/hooks/useAuth.api";
import logger from "@/services/frontendLogger";

// Memoized component for GitHub callback handling
const GitHubCallback = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: authData, error, mutate } = useAuthStatus();

  // Effect for mounting/unmounting
  useEffect(() => {
    logger.debug("GitHubCallback", "Component mounted", {
      pathname: location.pathname,
      search: location.search,
    });

    // Immediately revalidate the authentication status
    mutate();

    return () => {
      logger.debug("GitHubCallback", "Component unmounting");
    };
  }, [location, mutate]);

  // Main effect for handling authentication
  useEffect(() => {
    logger.info("GitHubCallback", "Authentication status check", {
      authDataExists: !!authData,
      isAuthenticated: authData?.isAuthenticated,
      hasError: !!error,
      user: authData?.user,
      searchParams: location.search,
    });

    if (error) {
      logger.error("GitHubCallback", "Error checking auth status", { error });
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "The connection with GitHub failed. Please try again.",
      });
      navigate("/", { replace: true });
      return;
    }

    if (authData) {
      if (authData.isAuthenticated && authData.user) {
        logger.info(
          "GitHubCallback",
          "Authentication successful, redirecting",
          {
            userId: authData.user.id,
          }
        );
        navigate("/playground", { replace: true });
      } else {
        logger.error("GitHubCallback", "Authentication failed - No user data");
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "The connection failed. Please try again.",
        });
        navigate("/", { replace: true });
      }
    }
  }, [authData, error, location.search, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
        <p className="text-muted-foreground">
          Please wait while connecting to GitHub
        </p>
      </div>
    </div>
  );
});

GitHubCallback.displayName = "GitHubCallback";

export default GitHubCallback;
