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

  // Effect pour le montage initial
  useEffect(() => {
    if (!mountRef.current) {
      logger.debug("ProtectedRoute", "Initial mount", {
        path: location.pathname
      });
      mountRef.current = true;
      verifyAuth();
    }
  }, [verifyAuth, location.pathname]);

  // Effect pour le nettoyage
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

  // Gestion de l'accès non autorisé
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
          timestamp: Date.now() // Ajoute un timestamp pour éviter les redirections en boucle
        }} 
        replace 
      />
    );
  }

  // Rendu du contenu protégé
  logger.debug("ProtectedRoute", "Rendering protected content", {
    path: location.pathname,
    isAuthenticated: true
  });

  // Retourne le contenu protégé
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Exporte une version mémorisée du composant pour éviter les re-rendus inutiles
export default memo(ProtectedRoute, (prevProps, nextProps) => {
  // Compare les props pour déterminer si un re-rendu est nécessaire
  return prevProps.children === nextProps.children;
});
