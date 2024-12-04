// File path: frontend/src/contexts/authContext.base.js

import { createContext } from "react";

// Creating a new context for the authentication
const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  revalidate: () => Promise.resolve(),
});

// Setting the display name of the context
AuthContext.displayName = "AuthContext";

export default AuthContext;
