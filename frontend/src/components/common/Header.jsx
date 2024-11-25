// File path: code_tutor2/frontend/src/components/common/Header.jsx

import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth";
import { Code2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

const Header = () => {
  const { user, isAuthenticated } = useAuth();

  logger.debug("Header", "Rendering header", { isAuthenticated });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            <span className="font-bold">Code Tutor</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {isAuthenticated && (
                <NavigationMenuItem>
                  <Link to="/playground">
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Playground
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>
                    {user.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  disabled
                  className="flex flex-col items-start"
                >
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                </DropdownMenuItem>
                <LogoutButton
                  variant="ghost"
                  className="w-full justify-start"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
