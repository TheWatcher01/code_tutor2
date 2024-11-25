// File path: code_tutor2/frontend/src/components/LoogoutButton.js

import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

const LogoutButton = ({ variant = "ghost", size = "default" }) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    logger.debug("LogoutButton", "Logout button clicked", { userId: user?.id });
    await logout();
  };

  if (!user) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className="flex items-center gap-2"
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
};

LogoutButton.defaultProps = {
  variant: "ghost",
  size: "default",
};

export default LogoutButton;
