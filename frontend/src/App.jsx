// File path : code_tutor2/frontend/src/App.jsx

import { useEffect, memo } from "react";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute } from "@/components/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthStatus } from "@/api/hooks/useAuth.api";
import { SwrProvider } from "@/api/swr.config";
import { useToast } from "@/hooks/use-toast";
import Home from "@/pages/Home";
import Playground from "@/pages/Playground";
import logger from "@/services/frontendLogger";

// Component that logs route changes
const RouteLogger = memo(() => {
  const location = useLocation();

  useEffect(() => {
    logger.debug("Router", "Route changed", {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);

  return null;
});

RouteLogger.displayName = "RouteLogger";

// Component that handles GitHub OAuth callback
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

// Main application component
const AppComponent = memo(() => {
  useEffect(() => {
    logger.info("App", "Application initialized", {
      environment: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_URL,
    });
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SwrProvider>
        <ThemeProvider defaultTheme="dark" storageKey="code-tutor-theme">
          <AuthProvider>
            <RouteLogger />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/auth/github/callback"
                element={<GitHubCallback />}
              />
              <Route
                path="/playground"
                element={
                  <ProtectedRoute>
                    <Playground />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">
                        Page Not Found
                      </h2>
                      <p className="text-muted-foreground">
                        The page you are looking for does not exist.
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </SwrProvider>
    </BrowserRouter>
  );
});

AppComponent.displayName = "AppComponent";

// Component that catches and handles React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("App", "React error boundary caught error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-sm text-left bg-muted p-4 rounded overflow-auto max-h-48">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  );
};

export default App;
