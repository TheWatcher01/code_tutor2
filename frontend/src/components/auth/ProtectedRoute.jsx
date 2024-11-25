// /src/components/auth/ProtectedRoute.jsx

import PropTypes from "prop-types";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      logger.debug("ProtectedRoute", "Verifying authentication", {
        path: location.pathname,
      });
      await checkAuth();
    };

    verifyAuth();
  }, [location.pathname, checkAuth]);

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    logger.warn("ProtectedRoute", "Unauthorized access attempt", {
      path: location.pathname,
    });

    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  logger.debug("ProtectedRoute", "Access granted", {
    path: location.pathname,
  });

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
