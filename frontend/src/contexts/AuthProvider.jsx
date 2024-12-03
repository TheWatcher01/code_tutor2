// File path: frontend/contexts/AuthProvider.jsx

import { useEffect, memo, useMemo } from "react";
import PropTypes from "prop-types";
import logger from "@/services/frontendLogger";
import AuthContext from "./authContext.base";
import { useAuthStatus } from "@/api/hooks/useAuth.api";

const AuthProvider = ({ children }) => {
  const { data, error, isLoading, mutate } = useAuthStatus();

  // Log authentication status changes
  useEffect(() => {
    if (data) {
      logger.info("AuthProvider", "Authentication status updated", {
        isAuthenticated: !!data.user,
      });
    }
    if (error) {
      logger.error("AuthProvider", "Authentication error", { error });
    }
  }, [data, error]);

  const contextValue = useMemo(() => ({
    user: data?.user || null,
    loading: isLoading,
    error: error,
    isAuthenticated: !!data?.user,
    revalidate: mutate,
  }), [data, error, isLoading, mutate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(AuthProvider);
