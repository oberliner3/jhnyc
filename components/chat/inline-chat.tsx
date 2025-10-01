'use client';

import React, { useState, useRef } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClickTracking } from '@/lib/experience-tracking/hooks';

interface InlineChatProps {
  /** Chat iframe URL */
  src?: string;
  /** Height of the chat embed */
  height?: number | string;
  /** Width of the chat embed */
  width?: number | string;
  /** Custom title */
  title?: string;
  /** Custom class name */
  className?: string;
  /** Show header with title and controls */
  showHeader?: boolean;
  /** Enable refresh button */
  showRefresh?: boolean;
}

const DEFAULT_CHAT_URL = "https://app.chatsimple.ai/iframe23/f32afe72-604b-4370-8925-4bd184983c75/973ce147-59fb-4ff8-b178-eab37198c1fe/b0a9f7de-992d-4f78-8add-ec34034fe737";

export function InlineChat({
  src = DEFAULT_CHAT_URL,
  height = 500,
  width = '100%',
  title = 'Live Chat Support',
  className = '',
  showHeader = true,
  showRefresh = true,
}: InlineChatProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force iframe reload
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Experience tracking
  const trackChatRefresh = useClickTracking('inline-chat-refresh');

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
    trackChatRefresh();
  };

  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  const containerWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <div 
      className={`
        relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm
        ${className}
      `}
      style={{ height: containerHeight, width: containerWidth }}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Connecting...</span>
              </div>
            )}
          </div>
          
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              aria-label="Refresh chat"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      )}

      {/* Chat Content */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Loading chat support...</p>
            </div>
          </div>
        )}
        
        <iframe
          key={key}
          ref={iframeRef}
          src={src}
          title={title}
          width="100%"
          height="100%"
          onLoad={handleIframeLoad}
          className="border-none bg-transparent"
          style={{
            display: 'block',
            height: showHeader ? `calc(${containerHeight} - 64px)` : containerHeight,
          }}
          allow="microphone; camera; geolocation; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        />
      </div>
    </div>
  );
}

export default InlineChat;