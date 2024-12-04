// File path: frontend/src/App.jsx

import React, { useEffect, memo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute } from "@/components/auth";
import GitHubCallback from "@/components/auth/GitHubCallback";
import { ThemeProvider } from "@/components/theme-provider";
import { SwrProvider } from "@/api/swr.config";
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

// Not Found component
const NotFound = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Page not found</h2>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
    </div>
  </div>
));

NotFound.displayName = "NotFound";

// Main application routes
const AppRoutes = memo(() => (
  <>
    <RouteLogger />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route
        path="/playground"
        element={
          <ProtectedRoute>
            <Playground />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
));

AppRoutes.displayName = "AppRoutes";

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
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <SwrProvider>
        <ThemeProvider defaultTheme="dark" storageKey="code-tutor-theme">
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </SwrProvider>
    </BrowserRouter>
  );
});

AppComponent.displayName = "AppComponent";

// Error Boundary component
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
            <h2 className="text-2xl font-bold mb-4">An error has occurred</h2>
            <p className="text-muted-foreground mb-4">
              An unexpected error has occurred. Please refresh the page or try
              again later.
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
              Refresh the page
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

// Root App component
const App = () => (
  <ErrorBoundary>
    <AppComponent />
  </ErrorBoundary>
);

export default App;
