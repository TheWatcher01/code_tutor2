// File path: code_tutor2/frontend/src/components/code_playground/VideoPlayer.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import FrontendLogger from "@/services/frontendLogger";

// VideoPlayer component for handling video playback
const VideoPlayer = ({ videoUrl, title }) => {
  // State for managing video playback and mute status
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  // Effect for logging component mount and unmount events
  useEffect(() => {
    FrontendLogger.info("VideoPlayer", "Component mounted", { videoUrl, title });
    return () => {
      FrontendLogger.info("VideoPlayer", "Component unmounted");
    };
  }, [videoUrl, title]);

  // Function to toggle video playback
  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
      FrontendLogger.debug("VideoPlayer", "Video paused");
    } else {
      video.play().catch(error => {
        FrontendLogger.error("VideoPlayer", "Error playing video", error);
      });
      FrontendLogger.debug("VideoPlayer", "Video played");
    }
    setIsPlaying(!isPlaying);
  };

  // Function to toggle video mute
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
    FrontendLogger.debug("VideoPlayer", `Video ${video.muted ? 'muted' : 'unmuted'}`);
  };

  // Function to handle video playback error
  const handleVideoError = (error) => {
    FrontendLogger.error("VideoPlayer", "Video playback error", error);
  };

  // JSX for rendering the video player
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{title || "Tutoriel vidéo"}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="relative h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={videoUrl}
            onPlay={() => {
              setIsPlaying(true);
              FrontendLogger.debug("VideoPlayer", "Video started playing");
            }}
            onPause={() => {
              setIsPlaying(false);
              FrontendLogger.debug("VideoPlayer", "Video paused");
            }}
            onError={handleVideoError}
          >
            Your browser does not support video playback.
          </video>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// PropTypes for the VideoPlayer component
VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default VideoPlayer;
