// File path: code_tutor2/frontend/src/components/common/Footer.jsx

import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import logger from "@/services/frontendLogger";

// Footer component for rendering the footer section of the application
const Footer = () => {
  // Logging the event of footer rendering
  logger.debug("Footer", "Rendering footer");

  // Getting the current year for copyright purposes
  const year = new Date().getFullYear();

  // JSX for rendering the footer section
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center gap-4 py-6 md:h-16 md:flex-row md:justify-between md:py-0">
        {/* Copyright section */}
        <div className="text-sm text-muted-foreground">
          © {year} Code Tutor. All rights reserved.
        </div>

        {/* Navigation links section */}
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:underline underline-offset-4">
            Terms
          </Link>
          <Link to="/privacy" className="hover:underline underline-offset-4">
            Privacy
          </Link>
          <a
            href="https://github.com/yourusername/code-tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </footer>
  );
};

// Exporting the Footer component for use in other parts of the application
export default Footer;
