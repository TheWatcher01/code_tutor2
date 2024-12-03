// File path: code_tutor2/frontend/src/components/playground/CodeEditor.jsx

import { useState, useCallback, memo, Suspense, useEffect, useMemo, useRef, lazy } from "react";
import PropTypes from "prop-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import logger from "@/services/frontendLogger";


// Constants

const EDITOR_DEFAULT_HEIGHT = "calc(100vh - 10rem)";
const PERFORMANCE_THRESHOLD = 100; // ms
const LAYOUT_PERFORMANCE_THRESHOLD = 16; // ms (1 frame @ 60fps)

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: "on",
  automaticLayout: true,
  renderWhitespace: "none",
  scrollbar: {
    vertical: "visible",
    horizontal: "visible",
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10
  }
};

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

const MonacoEditor = lazy(async () => {
  const startTime = performance.now();
  const isDebugMode = import.meta.env.MODE === 'development';

  if (isDebugMode) {
    logger.debug("CodeEditor", "Loading Monaco Editor");
  }

  try {
    const module = await import("@monaco-editor/react");
    const loadTime = performance.now() - startTime;
    logger.info("CodeEditor", "Monaco Editor loaded", {
      loadTimeMs: Math.round(loadTime),
      performanceStatus: loadTime > PERFORMANCE_THRESHOLD ? "warning" : "good"
    });
    return module;
  } catch (error) {
    logger.error("CodeEditor", "Failed to load Monaco Editor", { error });
    throw error;
  }
});

// Loading component
const EditorSkeleton = memo(() => {
  logger.debug("CodeEditor", "Rendering skeleton loader");
  return (
    <div className="w-full h-full animate-pulse">
      <Skeleton className="w-full h-full" />
    </div>
  );
});

EditorSkeleton.displayName = "EditorSkeleton";

const CodeEditor = memo(({ onChange, initialValue = "" }) => {
  const [language, setLanguage] = useState("javascript");
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const mountTimeRef = useRef(performance.now());
  const lastChangeRef = useRef(null);
  const layoutTimeRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Memoized style to avoid recalculations
  const editorWrapperStyle = useMemo(() => ({
    height: EDITOR_DEFAULT_HEIGHT,
    position: "relative",
    overflow: "hidden"
  }), []);

  // Optimized change handler
  const handleEditorChange = useCallback((value) => {
    const now = performance.now();
    
    // Log significant changes (avoid spam)
    if (!lastChangeRef.current || (now - lastChangeRef.current) > 1000) {
      logger.debug("CodeEditor", "Content updated", {
        languageUsed: language,
        contentLength: value?.length || 0,
        timeSinceLastChange: lastChangeRef.current ? now - lastChangeRef.current : 0,
        editorInstance: !!editorRef.current
      });
      lastChangeRef.current = now;
    }

    onChange?.(value);
  }, [onChange, language]);

  // Optimized language change handler
  const handleLanguageChange = useCallback((newLanguage) => {
    const startTime = performance.now();
    logger.info("CodeEditor", "Language change initiated", {
      from: language,
      to: newLanguage,
      editorInstance: !!editorRef.current
    });

    setLanguage(newLanguage);

    // Defer layout update
    requestAnimationFrame(() => {
      const layoutTime = performance.now() - startTime;
      logger.debug("CodeEditor", "Language change completed", {
        duration: Math.round(layoutTime),
        performanceStatus: layoutTime > LAYOUT_PERFORMANCE_THRESHOLD ? "warning" : "good"
      });
    });
  }, [language]);

  // Optimized editor mount handler
  const handleEditorDidMount = useCallback((editor) => {
    const mountDuration = performance.now() - mountTimeRef.current;

    // Defer layout operations
    requestAnimationFrame(() => {
      editorRef.current = editor;

      logger.info("CodeEditor", "Editor mounted and ready", {
        language,
        loadTimeMs: Math.round(mountDuration),
        performanceStatus: mountDuration > PERFORMANCE_THRESHOLD ? "warning" : "good",
        editorConfig: {
          ...EDITOR_OPTIONS,
          language
        }
      });

      // Initial configuration
      if (initialValue) {
        const valueSetStart = performance.now();
        editor.setValue(initialValue);
        
        logger.debug("CodeEditor", "Initial value set", {
          duration: Math.round(performance.now() - valueSetStart),
          contentLength: initialValue.length
        });
      }
    });
  }, [language, initialValue]);

  // Enhanced error handler
  const handleEditorError = useCallback((error) => {
    logger.error("CodeEditor", "Editor error occurred", {
      error: error.message,
      language,
      editorState: {
        mounted: !!editorRef.current,
        containerExists: !!containerRef.current,
        lastChange: lastChangeRef.current ? performance.now() - lastChangeRef.current : null
      }
    });
  }, [language]);

  // Optimized resize handler
  const handleResize = useCallback((entries) => {
    const now = performance.now();
    
    // Avoid too frequent calculations
    if (layoutTimeRef.current && (now - layoutTimeRef.current) < LAYOUT_PERFORMANCE_THRESHOLD) {
      return;
    }

    layoutTimeRef.current = now;
    
    requestAnimationFrame(() => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const layoutDuration = performance.now() - now;
          
          logger.debug("CodeEditor", "Container resized", {
            dimensions: {
              width: entry.contentRect.width,
              height: entry.contentRect.height
            },
            layoutDuration: Math.round(layoutDuration),
            performanceStatus: layoutDuration > LAYOUT_PERFORMANCE_THRESHOLD ? "warning" : "good"
          });
        }
      }
    });
  }, []);

  // Cleanup and monitoring effect
  useEffect(() => {
    const mountTime = mountTimeRef.current;
    
    logger.info("CodeEditor", "Component mounted", {
      initialLanguage: language,
      mountTime: performance.now() - mountTime
    });

    // Observer to detect layout issues
    resizeObserverRef.current = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
      logger.debug("CodeEditor", "Resize observer attached", {
        containerDimensions: containerRef.current.getBoundingClientRect()
      });
    }

    return () => {
      const lifetime = performance.now() - mountTime;
      logger.debug("CodeEditor", "Component unmounting", {
        finalLanguage: language,
        lifetime: Math.round(lifetime),
        performanceMetrics: {
          averageLayoutTime: layoutTimeRef.current ? Math.round(lifetime / layoutTimeRef.current) : 0,
          totalMountTime: Math.round(lifetime)
        }
      });

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [language, handleResize]);

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      <div className="border-b p-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div style={editorWrapperStyle}>
        <Suspense fallback={<EditorSkeleton />}>
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={EDITOR_OPTIONS}
            onMount={handleEditorDidMount}
            onError={handleEditorError}
          />
        </Suspense>
      </div>
    </div>
  );
});

CodeEditor.propTypes = {
  onChange: PropTypes.func,
  initialValue: PropTypes.string
};

CodeEditor.displayName = "CodeEditor";

export default CodeEditor;
