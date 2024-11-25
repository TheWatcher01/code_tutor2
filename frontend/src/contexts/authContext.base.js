// File path : code_tutor2/backend/src/middleware/authContext.base.js

import { createContext } from "react";

// Create the context with a default shape
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  logout: () => Promise.resolve(),
  isAuthenticated: false,
});

export default AuthContext;
