// File path: frontend/src/providers/RootProvider.jsx

import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts";
import { SwrProvider } from "@/api/swr.config";
import { Toaster } from "@/components/ui/toaster";
import PropTypes from "prop-types";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const RootProvider = ({ children }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SwrProvider>
          <ThemeProvider defaultTheme="dark" storageKey="code-tutor-theme">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </SwrProvider>
      </BrowserRouter>
    </Suspense>
  );
};

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RootProvider;
