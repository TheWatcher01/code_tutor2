// File path: code_tutor2/frontend/src/components/common/Footer.jsx

import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import logger from "@/services/frontendLogger";

const Footer = () => {
  logger.debug("Footer", "Rendering footer");

  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center gap-4 py-6 md:h-16 md:flex-row md:justify-between md:py-0">
        {/* Copyright */}
        <div className="text-sm text-muted-foreground">
          © {year} Code Tutor. All rights reserved.
        </div>

        {/* Links */}
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

export default Footer;
