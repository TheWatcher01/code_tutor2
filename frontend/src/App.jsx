// File path : code_tutor2/frontend/src/App.jsx

import { useEffect } from "react";
import React from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute } from "@/components/auth";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import Playground from "@/pages/Playground";
import logger from "@/services/frontendLogger";

// Route logger component
const RouteLogger = () => {
  const location = useLocation();

  useEffect(() => {
    logger.debug("Router", "Route changed", {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);

  return null;
};

// GitHub callback handler component
const GitHubCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.info("GitHubCallback", "Processing GitHub OAuth callback", {
      search: location.search,
    });

    // Vérifier le statut auth et rediriger
    fetch(`${import.meta.env.VITE_API_URL}/auth/status`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated) {
          logger.info(
            "GitHubCallback",
            "Authentication successful, redirecting"
          );
          navigate("/playground");
        } else {
          logger.error("GitHubCallback", "Authentication failed");
          navigate("/?error=auth_failed");
        }
      })
      .catch((error) => {
        logger.error("GitHubCallback", "Error checking auth status", { error });
        navigate("/?error=auth_failed");
      });
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Connexion en cours...</h2>
        <p className="text-muted-foreground">Veuillez patienter</p>
      </div>
    </div>
  );
};

// Main App Component
const AppComponent = () => {
  useEffect(() => {
    logger.info("App", "Application initialized", {
      environment: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_URL,
    });

    return () => {
      logger.debug("App", "Application unmounting");
    };
  }, []);

  return (
    <BrowserRouter       future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
    >
      <ThemeProvider defaultTheme="dark" storageKey="code-tutor-theme">
        <AuthProvider>
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
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      Page non trouvée
                    </h2>
                    <p className="text-muted-foreground">
                      La page que vous recherchez n&apos;existe pas.
                    </p>
                  </div>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Error Boundary Component
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
            <h2 className="text-2xl font-bold mb-4">
              Quelque chose s&apos;est mal passé
            </h2>
            <p className="text-muted-foreground mb-4">
              Une erreur inattendue s&apos;est produite. Veuillez rafraîchir la
              page ou réessayer plus tard.
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
              Rafraîchir la page
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  );
}
