// File path: code_tutor2/frontend/src/components/auth/LogoutButton.jsx

import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

// Function component for rendering the logout button
const LogoutButton = ({ variant = "ghost", size = "default", className }) => {
  // Extracting logout function and user state from the useAuth hook
  const { logout, user } = useAuth();

  // Logging the component rendering event with user and button properties
  logger.debug("LogoutButton", "Rendering", {
    hasUser: !!user,
    userId: user?.id,
    variant,
    size,
  });

  // Function to handle the logout button click event
  const handleLogout = async () => {
    try {
      // Logging the logout initiation event
      logger.info("LogoutButton", "Initiating logout", {
        userId: user?.id,
      });

      // Initiating the logout process
      await logout();

      // Logging the successful logout event
      logger.info("LogoutButton", "Logout successful", {
        userId: user?.id,
      });
    } catch (error) {
      // Logging the logout failure event with error details
      logger.error("LogoutButton", "Logout failed", {
        userId: user?.id,
        error: error.message,
      });
    }
  };

  // Early return with debug log if no user is present
  if (!user) {
    logger.debug("LogoutButton", "Not rendering - no user");
    return null;
  }

  // JSX for rendering the logout button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
};

// Defining prop types for the LogoutButton component
LogoutButton.propTypes = {
  variant: PropTypes.oneOf([
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ]),
  size: PropTypes.oneOf(["default", "sm", "lg", "icon"]),
  className: PropTypes.string,
};

export default LogoutButton;
