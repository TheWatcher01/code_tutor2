// File path: frontend/src/contexts/authContext.base.js

import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  revalidate: () => Promise.resolve(),
});

AuthContext.displayName = "AuthContext";

export default AuthContext;
