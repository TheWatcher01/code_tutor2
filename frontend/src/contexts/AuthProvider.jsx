import { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import api from "@/lib/axiosConfig";
import logger from "@/services/frontendLogger";
import AuthContext from "./authContext.base";

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      logger.debug("AuthProvider", "Checking auth status");
      const { data } = await api.get("/auth/status");
      setState((prev) => ({
        ...prev,
        user: data.isAuthenticated ? data.user : null,
        loading: false,
      }));
      logger.info("AuthProvider", "Auth status updated", {
        isAuthenticated: data.isAuthenticated,
      });
    } catch (err) {
      logger.error("AuthProvider", "Auth check failed", { error: err.message });
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Auth check failed",
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      logger.info("AuthProvider", "Logging out user");
      await api.post("/auth/logout");
      setState({ user: null, loading: false, error: null });
      logger.info("AuthProvider", "Logout successful");
    } catch (err) {
      logger.error("AuthProvider", "Logout failed", { error: err.message });
      setState((prev) => ({ ...prev, error: "Logout failed" }));
    }
  }, []);

  // Vérifie l'auth seulement sur les routes protégées
  useEffect(() => {
    const isProtectedRoute = window.location.pathname.startsWith("/playground");
    if (isProtectedRoute) {
      logger.debug("AuthProvider", "Protected route detected, checking auth");
      checkAuth();
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [checkAuth]);

  const value = {
    ...state,
    logout,
    checkAuth,
    isAuthenticated: !!state.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {state.loading ? (
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(AuthProvider);
