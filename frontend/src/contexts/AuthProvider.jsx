// File path: code_tutor2/frontend/src/contexts/AuthProvider.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import api from "@/lib/axiosConfig";
import logger from "@/services/frontendLogger";
import { AuthContext } from "@/contexts";

const DEBOUNCE_DELAY = 300;
const AUTH_STATUS_ENDPOINT = "/auth/status";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authCheckInProgress = useRef(false);
  const userRef = useRef(null);
  const checkTimeout = useRef(null);
  const mountedRef = useRef(true);

  const checkAuth = useCallback(
    async (force = false) => {
      try {
        if (!force && (authCheckInProgress.current || !mountedRef.current)) {
          logger.debug("AuthProvider", "Auth check skipped", {
            inProgress: authCheckInProgress.current,
            mounted: mountedRef.current,
          });
          return;
        }

        authCheckInProgress.current = true;
        logger.debug("AuthProvider", "Starting auth check");

        const { data } = await api.get(AUTH_STATUS_ENDPOINT);
        const nextUser = data.isAuthenticated ? data.user : null;

        if (
          mountedRef.current &&
          JSON.stringify(userRef.current) !== JSON.stringify(nextUser)
        ) {
          logger.info("AuthProvider", "User state updated", {
            wasAuthenticated: !!userRef.current,
            isAuthenticated: !!nextUser,
            userId: nextUser?.id,
          });

          userRef.current = nextUser;
          setUser(nextUser);
        } else {
          logger.debug("AuthProvider", "User state unchanged");
        }
      } catch (err) {
        if (mountedRef.current) {
          logger.error("AuthProvider", "Auth check failed", {
            error: err.message,
            status: err.response?.status,
          });
          userRef.current = null;
          setUser(null);
          setError("Authentication check failed");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          authCheckInProgress.current = false;
          logger.debug("AuthProvider", "Auth check completed", {
            loading: false,
            hasError: !!error,
          });
        }
      }
    },
    [error]
  );

  const debouncedCheckAuth = useCallback(
    (force = false) => {
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }

      if (!mountedRef.current) return;

      checkTimeout.current = setTimeout(() => {
        checkAuth(force);
      }, DEBOUNCE_DELAY);
    },
    [checkAuth]
  );

  useEffect(() => {
    mountedRef.current = true;
    logger.info("AuthProvider", "Initializing auth state");

    checkAuth(true);

    const handleFocus = () => {
      if (mountedRef.current) {
        logger.debug("AuthProvider", "Window focus - checking auth");
        debouncedCheckAuth();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      mountedRef.current = false;
      logger.debug("AuthProvider", "Cleaning up");
      window.removeEventListener("focus", handleFocus);

      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
    };
  }, [checkAuth, debouncedCheckAuth]);

  const logout = useCallback(async () => {
    try {
      logger.info("AuthProvider", "Initiating logout", {
        userId: userRef.current?.id,
      });

      await api.post("/auth/logout");

      if (mountedRef.current) {
        userRef.current = null;
        setUser(null);
        setError(null);
      }

      logger.info("AuthProvider", "Logout successful");
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = "Logout failed";
        logger.error("AuthProvider", errorMessage, {
          error: err.message,
          status: err.response?.status,
        });
        setError(errorMessage);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    if (error && mountedRef.current) {
      logger.debug("AuthProvider", "Clearing error state");
      setError(null);
    }
  }, [error]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      clearError,
      setUser,
      logout,
      checkAuth: debouncedCheckAuth,
      isAuthenticated: !!user,
    }),
    [user, loading, error, clearError, logout, debouncedCheckAuth]
  );

  useEffect(() => {
    if (mountedRef.current) {
      logger.debug("AuthProvider", "State updated", {
        isAuthenticated: !!user,
        isLoading: loading,
        hasError: !!error,
      });
    }
  }, [user, loading, error]);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(AuthProvider);
