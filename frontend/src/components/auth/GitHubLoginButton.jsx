// File path: code_tutor2/frontend/src/components/auth/GitHubLoginButton.jsx

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

// Function component for rendering the GitHub login button
const GitHubLoginButton = () => {
  // Extracting the loginWithGithub function from the useAuth hook
  const { loginWithGithub } = useAuth();

  // Function to handle the login button click event
  const handleLogin = () => {
    // Logging the event when the GitHub login button is clicked
    logger.debug("GitHubLoginButton", "GitHub login button clicked");
    // Initiating the GitHub login process
    loginWithGithub();
  };

  // JSX for rendering the GitHub login button
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
