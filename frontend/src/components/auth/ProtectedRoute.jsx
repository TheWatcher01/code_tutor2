// File path: code_tutor2/frontend/src/components/auth/ProtectedRoute.jsx

import PropTypes from "prop-types";
import { useEffect, useCallback, useRef, memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();
  
  const authCheckRequested = useRef(false);
  const initialCheckDone = useRef(false);
  const mountRef = useRef(false);

  const verifyAuth = useCallback(async () => {
    if (isAuthenticated || authCheckRequested.current || initialCheckDone.current) {
      logger.debug("ProtectedRoute", "Skipping auth verification", {
        isAuthenticated,
        path: location.pathname,
        checkRequested: authCheckRequested.current,
        initialCheckDone: initialCheckDone.current
      });
      return;
    }

    try {
      logger.debug("ProtectedRoute", "Starting auth verification", {
        path: location.pathname
      });
      
      authCheckRequested.current = true;
      await checkAuth();
      initialCheckDone.current = true;
      
      logger.debug("ProtectedRoute", "Auth verification completed", {
        path: location.pathname,
        isAuthenticated
      });
    } catch (error) {
      logger.error("ProtectedRoute", "Auth verification failed", {
        error: error.message,
        path: location.pathname
      });
    } finally {
      authCheckRequested.current = false;
    }
  }, [isAuthenticated, checkAuth, location.pathname]);

  // Effect for initial mount
  useEffect(() => {
    if (!mountRef.current) {
      logger.debug("ProtectedRoute", "Initial mount", {
        path: location.pathname
      });
      mountRef.current = true;
      verifyAuth();
    }
  }, [verifyAuth, location.pathname]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      logger.debug("ProtectedRoute", "Unmounting", {
        path: location.pathname
      });
      mountRef.current = false;
      authCheckRequested.current = false;
      initialCheckDone.current = false;
    };
  }, [location.pathname]);

  // Loading state
  if (loading) {
    logger.debug("ProtectedRoute", "Loading state", {
      path: location.pathname
    });
    
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle unauthorized access
  if (!isAuthenticated) {
    logger.warn("ProtectedRoute", "Unauthorized access", {
      path: location.pathname,
      redirectTo: "/"
    });

    return (
      <Navigate 
        to="/" 
        state={{ 
          from: location.pathname,
          unauthorized: true,
          timestamp: Date.now() // Add timestamp to prevent redirect loops
        }} 
        replace 
      />
    );
  }

  // Render protected content
  logger.debug("ProtectedRoute", "Rendering protected content", {
    path: location.pathname,
    isAuthenticated: true
  });

  // Return protected content
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export memoized component to prevent unnecessary re-renders
export default memo(ProtectedRoute, (prevProps, nextProps) => {
  // Compare props to determine if re-render is needed
  return prevProps.children === nextProps.children;
});
