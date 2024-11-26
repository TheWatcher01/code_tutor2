// File path: code_tutor2/frontend/src/components/auth/LogoutButton.jsx

import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

const LogoutButton = ({ variant = "ghost", size = "default", className }) => {
  const { logout, user } = useAuth();

  logger.debug("LogoutButton", "Rendering", {
    hasUser: !!user,
    userId: user?.id,
    variant,
    size,
  });

  const handleLogout = async () => {
    try {
      logger.info("LogoutButton", "Initiating logout", {
        userId: user?.id,
      });

      await logout();

      logger.info("LogoutButton", "Logout successful", {
        userId: user?.id,
      });
    } catch (error) {
      logger.error("LogoutButton", "Logout failed", {
        userId: user?.id,
        error: error.message,
      });
    }
  };

  // Early return with debug log
  if (!user) {
    logger.debug("LogoutButton", "Not rendering - no user");
    return null;
  }

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
