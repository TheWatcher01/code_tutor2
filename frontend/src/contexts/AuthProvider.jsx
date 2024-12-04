// File path: frontend/src/contexts/AuthProvider.jsx

import { useEffect, memo, useMemo } from "react";
import PropTypes from "prop-types";
import logger from "@/services/frontendLogger";
import AuthContext from "./authContext.base";
import { useAuthStatus } from "@/api/hooks/useAuth.api";
import { BeatLoader } from "react-spinners";

// Memoized component to prevent unnecessary re-renders
const AuthProvider = memo(({ children }) => {
  // Using the useAuthStatus hook to get the authentication status
  const { data, error, isLoading, mutate } = useAuthStatus();

  // Effect to log authentication errors or status updates
  useEffect(() => {
    if (error) {
      logger.error("AuthProvider", "Authentication error", { error });
    } else if (data) {
      logger.info("AuthProvider", "Auth status updated", {
        isAuthenticated: !!data.user,
        userId: data.user?.id,
      });
    }
  }, [error, data]);

  // Memoized function to compute the authentication state
  const authState = useMemo(
    () => ({
      user: data?.user || null,
      isAuthenticated: !!data?.user,
    }),
    [data?.user]
  );

  // Memoized function to compute the authentication actions
  const authActions = useMemo(
    () => ({
      revalidate: mutate,
    }),
    [mutate]
  );

  // Memoized function to compute the context value
  const contextValue = useMemo(
    () => ({
      ...authState,
      ...authActions,
      loading: isLoading,
      error,
    }),
    [authState, authActions, isLoading, error]
  );

  // If the authentication is loading, display a loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BeatLoader color="#4F46E5" size={15} />
      </div>
    );
  }

  // Providing the context value to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
});

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

AuthProvider.displayName = "AuthProvider";

export default AuthProvider;
