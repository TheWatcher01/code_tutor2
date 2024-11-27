// File path: code_tutor2/frontend/src/contexts/AuthProvider.jsx

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import api from "@/lib/axiosConfig";
import logger from "@/services/frontendLogger";
import AuthContext from "./authContext.base";

const DEBOUNCE_DELAY = 100;
const AUTH_STATUS_ENDPOINT = "/auth/status";
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  LOGOUT: "LOGOUT",
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

// Cache implementation
const authCache = {
  data: null,
  timestamp: null,
  isValid() {
    return (
      this.data &&
      this.timestamp &&
      Date.now() - this.timestamp < AUTH_CACHE_TTL
    );
  },
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  clear() {
    this.data = null;
    this.timestamp = null;
  },
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const mountedRef = useRef(true);
  const authCheckInProgress = useRef(false);

  const checkAuth = useCallback(async (force = false) => {
    try {
      if (!force && !mountedRef.current) return;

      // Check the cache if not in force mode
      if (!force && authCache.isValid()) {
        const cachedUser = authCache.data;
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: cachedUser });
        return;
      }

      if (authCheckInProgress.current) {
        logger.debug("AuthProvider", "Auth check already in progress");
        return;
      }

      authCheckInProgress.current = true;
      logger.debug("AuthProvider", "Starting auth check");

      const { data } = await api.get(AUTH_STATUS_ENDPOINT);
      const nextUser = data.isAuthenticated ? data.user : null;

      if (mountedRef.current) {
        authCache.set(nextUser);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: nextUser });
        logger.info("AuthProvider", "User state updated", {
          isAuthenticated: !!nextUser,
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        authCache.clear();
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: "Authentication check failed",
        });
        logger.error("AuthProvider", "Auth check failed", {
          error: err.message,
        });
      }
    } finally {
      authCheckInProgress.current = false;
    }
  }, []);

  // Debounce optimization with useMemo
  const debouncedCheckAuth = useMemo(
    () => debounce(checkAuth, DEBOUNCE_DELAY),
    [checkAuth]
  );

  useEffect(() => {
    mountedRef.current = true;
    logger.info("AuthProvider", "Initializing auth state");

    // Immediate check on mount
    checkAuth(true);

    const handleFocus = () => {
      if (mountedRef.current && !state.loading) {
        debouncedCheckAuth();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      mountedRef.current = false;
      debouncedCheckAuth.cancel();
      window.removeEventListener("focus", handleFocus);
      logger.debug("AuthProvider", "Cleanup completed");
    };
  }, [checkAuth, debouncedCheckAuth, state.loading]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      authCache.clear();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      logger.info("AuthProvider", "Logout successful");
    } catch (err) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: "Logout failed",
      });
      logger.error("AuthProvider", "Logout failed", {
        error: err.message,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      logout,
      clearError,
      checkAuth: debouncedCheckAuth,
    }),
    [state, logout, clearError, debouncedCheckAuth]
  );

  // Loading state optimization
  if (state.loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(AuthProvider);
