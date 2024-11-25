// File path: code_tutor2/frontend/src/components/common/Layout.jsx

import PropTypes from "prop-types";
import { Toaster } from "@/components/ui/toaster";
import Header from "./Header";
import Footer from "./Footer";
import logger from "@/services/frontendLogger";

const Layout = ({ children }) => {
  logger.debug("Layout", "Rendering main layout");

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container py-6">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
