// File path: code_tutor2/frontend/src/components/auth/AuthForm.jsx

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import GitHubLoginButton from "./GitHubLoginButton";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

// Function component for rendering the authentication form
const AuthForm = () => {
  // Extracting error state from the useAuth hook
  const { error } = useAuth();

  // Logging the component mount event
  logger.debug("AuthForm", "Auth form component mounted");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to Code Tutor
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to start learning and practicing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <GitHubLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Code Tutor
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
