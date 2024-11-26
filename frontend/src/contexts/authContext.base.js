// File path: code_tutor2/frontend/src/contexts/authContext.base.js

import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  setError: () => {},
  clearError: () => {},
  setUser: () => {},
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  isAuthenticated: false,
});

AuthContext.displayName = "AuthContext";

export default AuthContext;
