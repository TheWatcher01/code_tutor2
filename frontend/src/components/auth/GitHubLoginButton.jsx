// File path: code_tutor2/frontend/src/components/auth/GitHubLoginButton.jsx

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

const GitHubLoginButton = () => {
  const { loginWithGithub } = useAuth();

  const handleLogin = () => {
    logger.debug("GitHubLoginButton", "GitHub login button clicked");
    loginWithGithub();
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleLogin}
    >
      <Github className="h-5 w-5" />
      <span>Continue with GitHub</span>
    </Button>
  );
};

export default GitHubLoginButton;
