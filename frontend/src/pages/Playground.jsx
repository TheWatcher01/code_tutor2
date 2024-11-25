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
import { Menu, X, Play, Code2 } from "lucide-react";
import VideoPlayer from "@/components/playground/VideoPlayer";
import ChatInterface from "@/components/playground/ChatInterface";
import CodeEditor from "@/components/playground/CodeEditor";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";
import { LogoutButton } from "@/components/auth";

// Constants
const PANEL_CONFIG = {
  INITIAL_SIZES: {
    SIDEBAR: 25,
    EDITOR: 50,
    PREVIEW: 25,
  },
  MIN_SIZES: {
    SIDEBAR: 20,
    EDITOR: 30,
    PREVIEW: 20,
  },
};

// Memoized components for performance optimization
const MemoizedVideoPlayer = memo(VideoPlayer);
const MemoizedChatInterface = memo(ChatInterface);
const MemoizedCodeEditor = memo(CodeEditor);

// Navbar Component with PropTypes
const Navbar = memo(({ isMobile }) => {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Code Tutor</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isMobile && <LogoutButton />}
        </div>
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
  const [code, setCode] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState("video");
  const isMobile = useMobile();

  // Initialize logging
  useEffect(() => {
    logger.info("Playground", "Component mounted", {
      userId: user?.id,
      isMobile,
    });

    return () => {
      logger.debug("Playground", "Component unmounted");
    };
  }, [user, isMobile]);

  // Code change handler
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    logger.debug("Playground", "Code updated", {
      codeLength: newCode.length,
    });
  }, []);

  // Preview update handler
  useEffect(() => {
    if (!code || !showPreview) return;

    const updatePreview = () => {
      try {
        const iframe = document.getElementById("preview-iframe");
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          doc.open();
          doc.write(code);
          doc.close();
          logger.debug("Playground", "Preview updated successfully");
        }
      } catch (error) {
        logger.error("Playground", "Preview update failed", { error });
      }
    };

    const timeoutId = setTimeout(updatePreview, 1000); // Debounce preview updates
    return () => clearTimeout(timeoutId);
  }, [code, showPreview]);

  // Tab change handler
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    logger.debug("Playground", "Tab changed", { newTab: value });
  }, []);

  // Preview toggle handler
  const togglePreview = useCallback((show) => {
    setShowPreview(show);
    logger.debug("Playground", "Preview toggled", { visible: show });
  }, []);

  // Desktop layout component
  const DesktopLayout = useCallback(
    () => (
      <div className="flex flex-col h-screen">
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
                <TabsTrigger value="video">Vidéo</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="video" className="h-[calc(100%-40px)]">
                <MemoizedVideoPlayer
                  videoUrl="https://exemple.com/video.mp4"
                  title="Introduction à JavaScript"
                />
              </TabsContent>
              <TabsContent value="chat" className="h-[calc(100%-40px)]">
                <MemoizedChatInterface />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            defaultSize={PANEL_CONFIG.INITIAL_SIZES.EDITOR}
            minSize={PANEL_CONFIG.MIN_SIZES.EDITOR}
          >
            <div className="h-full flex flex-col">
              <div className="border-b p-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {!showPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePreview(true)}
                      aria-label="Show preview"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <span className="font-medium">Éditeur</span>
              </div>
              <div className="flex-1">
                <MemoizedCodeEditor onChange={handleCodeChange} />
              </div>
            </div>
          </ResizablePanel>

          {showPreview && (
            <>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={PANEL_CONFIG.INITIAL_SIZES.PREVIEW}
                minSize={PANEL_CONFIG.MIN_SIZES.PREVIEW}
              >
                <div className="h-full flex flex-col">
                  <div className="border-b p-2 flex justify-between items-center">
                    <h3 className="font-medium">Prévisualisation</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePreview(false)}
                      aria-label="Hide preview"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-4">
                    <iframe
                      id="preview-iframe"
                      className="w-full h-full border rounded-lg bg-background"
                      title="Code preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    ),
    [activeTab, handleTabChange, showPreview, togglePreview, handleCodeChange]
  );

  // Mobile layout component
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
                      <TabsTrigger value="video">Vidéo</TabsTrigger>
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="video" className="h-[calc(100%-40px)]">
                      <MemoizedVideoPlayer
                        videoUrl="https://exemple.com/video.mp4"
                        title="Introduction à JavaScript"
                      />
                    </TabsContent>
                    <TabsContent value="chat" className="h-[calc(100%-40px)]">
                      <MemoizedChatInterface />
                    </TabsContent>
                  </Tabs>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="flex-1">
          <MemoizedCodeEditor onChange={handleCodeChange} />
        </div>
      </div>
    ),
    [activeTab, handleTabChange, handleCodeChange]
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

// Optimize component display name for React DevTools
Playground.displayName = "Playground";

export default memo(Playground);
