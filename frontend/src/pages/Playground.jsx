// File path: code_tutor2/frontend/src/pages/Playground.jsx

import { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Menu, Code2 } from "lucide-react"; // Removed unused icons
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";
import { LogoutButton } from "@/components/auth";

// Constants simplified (removed preview-related config)
const PANEL_CONFIG = {
  INITIAL_SIZES: {
    SIDEBAR: 30,
    MAIN: 70,
  },
  MIN_SIZES: {
    SIDEBAR: 20,
    MAIN: 50,
  },
};

// Simplified Navbar Component
const Navbar = memo(({ isMobile }) => {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Code Tutor</h1>
        </div>
        {!isMobile && (
          <div className="flex items-center">
            <LogoutButton className="ml-4" />
          </div>
        )}
      </div>
    </div>
  );
});

Navbar.propTypes = {
  isMobile: PropTypes.bool,
};

Navbar.displayName = "Navbar";

const Playground = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const isMobile = useMobile();

  // Simplified logging
  useEffect(() => {
    logger.info("Playground", "Component mounted", {
      userId: user?.id,
      isMobile,
    });

    return () => {
      logger.debug("Playground", "Component unmounted");
    };
  }, [user, isMobile]);

  // Simplified tab change handler
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    logger.debug("Playground", "Tab changed", { newTab: value });
  }, []);

  // Simplified Desktop layout
  const DesktopLayout = useCallback(
    () => (
      <div className="flex flex-col h-screen w-screen">
        <Navbar isMobile={false} />
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            defaultSize={PANEL_CONFIG.INITIAL_SIZES.SIDEBAR}
            minSize={PANEL_CONFIG.MIN_SIZES.SIDEBAR}
          >
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="h-full"
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="h-[calc(100%-40px)]">
                <div className="p-4 text-center text-muted-foreground">
                  Chat Interface Placeholder
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            defaultSize={PANEL_CONFIG.INITIAL_SIZES.MAIN}
            minSize={PANEL_CONFIG.MIN_SIZES.MAIN}
          >
            <div className="h-full flex flex-col">
              <div className="border-b p-2 flex justify-between items-center">
                <span className="font-medium flex-1 text-center">
                  Main Content Area
                </span>
              </div>
              <div className="flex-1 p-4 text-center text-muted-foreground">
                Content Placeholder
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    ),
    [activeTab, handleTabChange]
  );

  // Simplified Mobile layout
  const MobileLayout = useCallback(
    () => (
      <div className="h-screen flex flex-col">
        <Navbar isMobile={true} />
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LogoutButton />
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="h-[80vh]">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="h-full"
                  >
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat" className="h-[calc(100%-40px)]">
                      <div className="p-4 text-center text-muted-foreground">
                        Chat Interface Placeholder
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="flex-1 p-4 text-center text-muted-foreground">
          Mobile Content Placeholder
        </div>
      </div>
    ),
    [activeTab, handleTabChange]
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

Playground.displayName = "Playground";

export default memo(Playground);
