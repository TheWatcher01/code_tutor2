// File path: code_tutor2/frontend/src/contexts/AuthProvider.jsx

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import logger from "../services/frontendLogger";
import AuthContext from "./authContext.base";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount and after window focus
  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.debug("AuthContext", "Checking authentication status");
        const { data } = await axios.get("/api/auth/status", {
          withCredentials: true,
        });

        if (data.isAuthenticated) {
          logger.info("AuthContext", "User authenticated", {
            userId: data.user.id,
          });
          setUser(data.user);
        } else {
          logger.info("AuthContext", "User not authenticated");
          setUser(null);
        }
      } catch (err) {
        logger.error("AuthContext", "Error checking auth status", err);
        setError("Failed to verify authentication status");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Recheck auth status when window regains focus
    const handleFocus = () => {
      logger.debug("AuthContext", "Window focused, rechecking auth");
      checkAuth();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const logout = async () => {
    try {
      logger.info("AuthContext", "Initiating logout");
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      logger.info("AuthContext", "Logout successful");
      setUser(null);
    } catch (err) {
      logger.error("AuthContext", "Logout failed", err);
      setError("Failed to logout");
    }
  };

  // Monitor session activity
  useEffect(() => {
    let sessionCheckInterval;

    if (user) {
      sessionCheckInterval = setInterval(async () => {
        try {
          const { data } = await axios.get("/api/auth/status", {
            withCredentials: true,
          });
          if (!data.isAuthenticated && user) {
            logger.warn("AuthContext", "Session expired", { userId: user.id });
            setUser(null);
            setError("Session expired. Please login again.");
          }
        } catch (err) {
          logger.error("AuthContext", "Session check failed", err);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes
    }

    return () => clearInterval(sessionCheckInterval);
  }, [user]);

  const value = {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
