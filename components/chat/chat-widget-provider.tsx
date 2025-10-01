'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from './chat-widget';
import { 
  getChatConfig, 
  shouldEnableChatOnPath, 
  shouldAutoOpenOnPath, 
  getAutoOpenDelay 
} from '@/lib/chat/config';

interface ChatWidgetProviderProps {
  /** Override default configuration */
  configOverride?: Partial<typeof getChatConfig>;
  /** Custom chat URL */
  chatUrl?: string;
  /** Force enable/disable regardless of path */
  forceEnabled?: boolean;
  /** Custom theme */
  theme?: 'light' | 'dark';
}

export function ChatWidgetProvider({
  configOverride,
  chatUrl,
  forceEnabled,
  theme,
}: ChatWidgetProviderProps) {
  const pathname = usePathname();

  // Get configuration with overrides
  const config = useMemo(() => {
    const baseConfig = getChatConfig();
    
    return {
      ...baseConfig,
      ...configOverride,
      ...(chatUrl && { chatUrl }),
      ...(theme && { theme }),
    };
  }, [configOverride, chatUrl, theme]);

  // Determine if chat should be enabled on current path
  const isEnabled = useMemo(() => {
    if (forceEnabled !== undefined) return forceEnabled;
    return shouldEnableChatOnPath(pathname, config);
  }, [pathname, config, forceEnabled]);

  // Determine auto-open settings
  const autoOpenDelay = useMemo(() => {
    if (!shouldAutoOpenOnPath(pathname, config)) return undefined;
    return getAutoOpenDelay(config);
  }, [pathname, config]);

  // Don't render anything if chat is disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <ChatWidget
      src={config.chatUrl}
      position={config.position}
      height={config.dimensions.height}
      width={config.dimensions.width}
      theme={config.theme}
      enabled={true}
      title={config.title}
      autoOpenDelay={autoOpenDelay}
      showUnreadIndicator={config.showUnreadIndicator}
    />
  );
}

export default ChatWidgetProvider;