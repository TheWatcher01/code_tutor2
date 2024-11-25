// File path : code_tutor2/backend/src/middleware/authContext.base.js

import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  setError: () => {},
  setUser: () => {},
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  isAuthenticated: false,
});

export default AuthContext;
