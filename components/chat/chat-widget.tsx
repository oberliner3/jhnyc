'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChatWidgetProps {
  /** Chat widget configuration */
  src?: string;
  /** Widget position on screen */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Initial height of the chat widget */
  height?: number | string;
  /** Initial width of the chat widget */
  width?: number | string;
  /** Widget theme */
  theme?: "light" | "dark";
  /** Enable/disable widget */
  enabled?: boolean;
  /** Custom button icon */
  customIcon?: React.ReactNode;
  /** Custom button styles */
  buttonClassName?: string;
  /** Widget title for accessibility */
  title?: string;
  /** Auto-open widget after delay (in milliseconds) */
  autoOpenDelay?: number;
  /** Show unread message indicator */
  showUnreadIndicator?: boolean;
}

const DEFAULT_CHAT_URL =
  "https://app.chatsimple.ai/iframe23/f32afe72-604b-4370-8925-4bd184983c75/973ce147-59fb-4ff8-b178-eab37198c1fe/b0a9f7de-992d-4f78-8add-ec34034fe737";

export function ChatWidget({
  src = DEFAULT_CHAT_URL,
  position = "bottom-right",
  height = 400,
  width = 350,
  theme = "light",
  enabled = true,
  customIcon,
  buttonClassName = "",
  title = "Chat Support",
  autoOpenDelay,
  showUnreadIndicator = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(showUnreadIndicator);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    setIsLoading(true);
    setHasUnread(false);
  }, [setIsOpen, setIsLoading, setHasUnread]);

  // Auto-open functionality
  useEffect(() => {
    if (autoOpenDelay && autoOpenDelay > 0) {
      const timer = setTimeout(() => {
        handleOpenChat();
      }, autoOpenDelay);

      return () => clearTimeout(timer);
    }
  }, [autoOpenDelay, handleOpenChat]);

  // Position classes mapping
  const getPositionClasses = () => {
    const baseClasses = "fixed z-50";
    switch (position) {
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`;
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`;
      case "top-right":
        return `${baseClasses} top-4 right-4`;
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Widget button theme styles
  const getButtonStyles = () => {
    const baseStyles =
      "relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105";

    if (theme === "dark") {
      return `${baseStyles} bg-gray-800 text-white hover:bg-gray-700 border-gray-700`;
    }

    return `${baseStyles} bg-white text-gray-700 hover:bg-gray-50 border-gray-200`;
  };

  // Chat window styles
  const getChatWindowStyles = () => {
    const baseStyles =
      "border-none rounded-2xl shadow-2xl transition-all duration-300 ease-in-out";

    if (theme === "dark") {
      return `${baseStyles} bg-gray-900 border-gray-700`;
    }

    return `${baseStyles} bg-white border-gray-200`;
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          size="lg"
          className={`
            ${getButtonStyles()}
            ${buttonClassName}
            w-14 h-14 rounded-full p-0 border
          `}
          aria-label={`Open ${title}`}
        >
          {/* Unread indicator */}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}

          {customIcon || <MessageCircle className="w-6 h-6" />}
        </Button>
      )}

      {/* Chat Widget Window */}
      {isOpen && (
        <div
          className={`
            ${getChatWindowStyles()}
            ${
              isMinimized
                ? "h-12"
                : `h-[${typeof height === "number" ? height + "px" : height}]`
            }
            w-[${typeof width === "number" ? width + "px" : width}]
            max-w-[90vw] max-h-[80vh]
            overflow-hidden
          `}
          style={{
            height: isMinimized
              ? "48px"
              : typeof height === "number"
              ? `${height}px`
              : height,
            width: typeof width === "number" ? `${width}px` : width,
          }}
        >
          {/* Chat Header */}
          <div
            className={`
            flex items-center justify-between p-3 border-b
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gray-50 border-gray-200 text-gray-800"
            }
          `}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{title}</span>
              {isLoading && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimizeChat}
                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseChat}
                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Close chat"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="relative flex-1 overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading chat...
                    </p>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={src}
                title={title}
                width="100%"
                height="100%"
                onLoad={handleIframeLoad}
                className="border-none bg-transparent"
                style={{
                  display: "block",
                  height: `${
                    typeof height === "number"
                      ? height - 48
                      : "calc(100% - 48px)"
                  }`,
                }}
                allow="microphone; camera; geolocation; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
