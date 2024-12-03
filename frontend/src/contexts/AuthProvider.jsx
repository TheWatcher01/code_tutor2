// File path: frontend/contexts/AuthProvider.jsx

import { useEffect, memo } from "react";
import PropTypes from "prop-types";
import logger from "@/services/frontendLogger";
import AuthContext from "./authContext.base";
import { useAuthStatus } from "@/api/hooks/useAuth.api";

const AuthProvider = ({ children }) => {
  const { data, error, isLoading, mutate } = useAuthStatus();

  // Log des changements d'état d'authentification
  useEffect(() => {
    if (data) {
      logger.info("AuthProvider", "Auth status updated", {
        isAuthenticated: !!data.user,
      });
    }
    if (error) {
      logger.error("AuthProvider", "Auth error", { error });
    }
  }, [data, error]);

  const value = {
    user: data?.user || null,
    loading: isLoading,
    error: error,
    isAuthenticated: !!data?.user,
    revalidate: mutate,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(AuthProvider);
