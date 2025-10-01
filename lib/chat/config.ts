/**
 * Chat Widget Configuration
 * Centralized configuration for the ChatSimple integration
 */

export interface ChatConfig {
  /** ChatSimple iframe URL */
  chatUrl: string;
  /** Enable/disable chat widget globally */
  enabled: boolean;
  /** Widget position */
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Widget dimensions */
  dimensions: {
    height: number;
    width: number;
  };
  /** Widget theme */
  theme: 'light' | 'dark';
  /** Auto-open settings */
  autoOpen: {
    enabled: boolean;
    delay: number; // milliseconds
    onlyForNewVisitors: boolean;
  };
  /** Show unread indicator */
  showUnreadIndicator: boolean;
  /** Custom widget title */
  title: string;
  /** Pages where chat should be disabled */
  disabledPaths?: string[];
  /** Pages where chat should auto-open */
  autoOpenPaths?: string[];
}

// Default chat configuration
export const defaultChatConfig: ChatConfig = {
  chatUrl: "https://app.chatsimple.ai/iframe23/f32afe72-604b-4370-8925-4bd184983c75/973ce147-59fb-4ff8-b178-eab37198c1fe/b0a9f7de-992d-4f78-8add-ec34034fe737",
  enabled: true,
  position: 'bottom-right',
  dimensions: {
    height: 400,
    width: 350,
  },
  theme: 'light',
  autoOpen: {
    enabled: false,
    delay: 5000, // 5 seconds
    onlyForNewVisitors: true,
  },
  showUnreadIndicator: false,
  title: 'Chat Support',
  disabledPaths: [
    '/admin',
    '/api',
    '/checkout/thank-you',
  ],
  autoOpenPaths: [
    '/support',
    '/contact',
    '/help',
  ],
};

/**
 * Get chat configuration based on environment and user preferences
 */
export function getChatConfig(): ChatConfig {
  const config = { ...defaultChatConfig };

  // Environment variable overrides
  if (process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED !== undefined) {
    config.enabled = process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED === 'true';
  }

  if (process.env.NEXT_PUBLIC_CHAT_WIDGET_AUTO_OPEN !== undefined) {
    config.autoOpen.enabled = process.env.NEXT_PUBLIC_CHAT_WIDGET_AUTO_OPEN === 'true';
  }

  if (process.env.NEXT_PUBLIC_CHAT_WIDGET_POSITION) {
    const position = process.env.NEXT_PUBLIC_CHAT_WIDGET_POSITION as ChatConfig['position'];
    if (['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(position)) {
      config.position = position;
    }
  }

  if (process.env.NEXT_PUBLIC_CHAT_WIDGET_THEME) {
    const theme = process.env.NEXT_PUBLIC_CHAT_WIDGET_THEME as ChatConfig['theme'];
    if (['light', 'dark'].includes(theme)) {
      config.theme = theme;
    }
  }

  // Environment-based overrides
  if (process.env.NODE_ENV === 'development') {
    // Maybe disable auto-open in development
    config.autoOpen.enabled = false;
  }

  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    // Enable features that are production-ready
    config.showUnreadIndicator = true;
  }

  return config;
}

/**
 * Check if chat should be enabled on current path
 */
export function shouldEnableChatOnPath(pathname: string, config: ChatConfig): boolean {
  if (!config.enabled) return false;

  // Check if current path is in disabled paths
  if (config.disabledPaths?.some(path => pathname.startsWith(path))) {
    return false;
  }

  return true;
}

/**
 * Check if chat should auto-open on current path
 */
export function shouldAutoOpenOnPath(pathname: string, config: ChatConfig): boolean {
  if (!config.autoOpen.enabled) return false;

  // Check if current path is in auto-open paths
  return config.autoOpenPaths?.some(path => pathname.startsWith(path)) || false;
}

/**
 * Get auto-open delay based on user visit history
 */
export function getAutoOpenDelay(config: ChatConfig): number {
  if (!config.autoOpen.enabled) return 0;

  // Check if user is a new visitor
  if (config.autoOpen.onlyForNewVisitors) {
    const hasVisited = typeof window !== 'undefined' && 
      localStorage.getItem('chat_widget_visited') === 'true';
    
    if (hasVisited) return 0;
    
    // Mark as visited
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_widget_visited', 'true');
    }
  }

  return config.autoOpen.delay;
}