// File path: code_tutor2/frontend/src/contexts/AuthProvider.jsx

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../lib/axiosConfig";
import logger from "../services/frontendLogger";
import AuthContext from "./authContext.base";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/status");
      setUser(data.isAuthenticated ? data.user : null);
      logger.debug("AuthProvider", "Auth check completed", {
        isAuthenticated: data.isAuthenticated,
      });
    } catch (err) {
      logger.error("AuthProvider", "Auth check failed", err);
      setUser(null);
      setError("Authentication check failed");
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();

    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      logger.info("AuthProvider", "Logout successful");
    } catch (err) {
      logger.error("AuthProvider", "Logout failed", err);
      setError("Logout failed");
    }
  };

  const value = {
    user,
    loading,
    error,
    setError,
    setUser,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  if (loading) {
    return null; // ou un composant de chargement
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
