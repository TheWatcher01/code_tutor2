// File path: code_tutor2/frontend/src/components/auth/ProtectedRoute.jsx

import PropTypes from "prop-types";
import { useEffect, useCallback, useRef, memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";
import { Loader2 } from "lucide-react";

// Function component for rendering the protected route
const ProtectedRoute = ({ children }) => {
  // Extracting authentication status, loading state and checkAuth function from the useAuth hook
  const { isAuthenticated, loading, checkAuth } = useAuth();
  // Extracting current location from the useLocation hook
  const location = useLocation();
  
  // Creating refs for tracking authentication check status and initial mount
  const authCheckRequested = useRef(false);
  const initialCheckDone = useRef(false);
  const mountRef = useRef(false);

  // Function to verify authentication status
  const verifyAuth = useCallback(async () => {
    // If the user is already authenticated or the authentication check is already requested or the initial check is already done, skip the verification
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
      // Log the start of the authentication verification process
      logger.debug("ProtectedRoute", "Starting auth verification", {
        path: location.pathname
      });
      
      // Set the authentication check status to requested
      authCheckRequested.current = true;
      // Initiate the authentication check
      await checkAuth();
      // Set the initial check status to done
      initialCheckDone.current = true;
      
      // Log the completion of the authentication verification process
      logger.debug("ProtectedRoute", "Auth verification completed", {
        path: location.pathname,
        isAuthenticated
      });
    } catch (error) {
      // Log the failure of the authentication verification process
      logger.error("ProtectedRoute", "Auth verification failed", {
        error: error.message,
        path: location.pathname
      });
    } finally {
      // Reset the authentication check status
      authCheckRequested.current = false;
    }
  }, [isAuthenticated, checkAuth, location.pathname]);

  // Effect for initial mount
  useEffect(() => {
    // If it's the initial mount, log the event and initiate the authentication verification
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
    // Log the unmounting event and reset the mount and authentication check status
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
    // If the user is not authenticated, log the event and redirect to the home page
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
  // If the user is authenticated, log the event and render the protected content
  logger.debug("ProtectedRoute", "Rendering protected content", {
    path: location.pathname,
    isAuthenticated: true
  });

  // Return protected content
  return children;
};

// Define prop types for the ProtectedRoute component
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export memoized component to prevent unnecessary re-renders
export default memo(ProtectedRoute, (prevProps, nextProps) => {
  // Compare props to determine if re-render is needed
  return prevProps.children === nextProps.children;
});
