# ChatSimple Widget Integration

This directory contains components for integrating ChatSimple chat widget into your Next.js application using proper React patterns and best practices.

## Components Overview

### 1. `ChatWidget` - Main Widget Component
A fully-featured floating chat widget with minimize/maximize functionality.

**Features:**
- Floating button that opens chat window
- Minimize/maximize functionality
- Loading states and error handling
- Configurable positioning and theming
- Auto-open functionality
- Unread message indicator
- Experience tracking integration

### 2. `ChatWidgetProvider` - Smart Provider
Intelligent wrapper that handles path-based logic and configuration.

**Features:**
- Automatic enable/disable based on current path
- Auto-open on specific pages
- Configuration overrides
- Environment-based settings

### 3. `InlineChat` - Embedded Chat
Component for embedding chat directly in pages (like contact page).

**Features:**
- Embedded chat iframe with header controls
- Refresh functionality
- Loading states
- Customizable dimensions and styling

## Quick Setup

### 1. Basic Integration (Global Widget)

The chat widget is already integrated in your app layout (`app/layout.tsx`):

```tsx
import { ChatWidgetProvider } from '@/components/chat/chat-widget-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Your app content */}
        <ChatWidgetProvider />
      </body>
    </html>
  );
}
```

### 2. Environment Configuration

Add to your `.env.local`:

```bash
# Chat Widget Configuration
NEXT_PUBLIC_CHAT_WIDGET_ENABLED=true
NEXT_PUBLIC_CHAT_WIDGET_AUTO_OPEN=false
NEXT_PUBLIC_CHAT_WIDGET_POSITION=bottom-right
NEXT_PUBLIC_CHAT_WIDGET_THEME=light
```

## Usage Examples

### Floating Widget with Custom Config

```tsx
import { ChatWidget } from '@/components/chat/chat-widget';

export default function MyPage() {
  return (
    <div>
      {/* Page content */}
      <ChatWidget 
        position="bottom-left"
        theme="dark"
        autoOpenDelay={5000}
        showUnreadIndicator={true}
      />
    </div>
  );
}
```

### Inline Chat (Embedded)

```tsx
import { InlineChat } from '@/components/chat/inline-chat';

export default function ContactPage() {
  return (
    <div>
      <h1>Contact Us</h1>
      
      <InlineChat 
        height={500}
        title="Live Support"
        showHeader={true}
        showRefresh={true}
      />
    </div>
  );
}
```

### Smart Provider with Overrides

```tsx
import { ChatWidgetProvider } from '@/components/chat/chat-widget-provider';

export default function ProductPage() {
  return (
    <div>
      {/* Page content */}
      <ChatWidgetProvider 
        theme="dark"
        forceEnabled={true}
        configOverride={{
          autoOpen: { enabled: true, delay: 3000 }
        }}
      />
    </div>
  );
}
```

## Configuration Options

### ChatWidget Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | ChatSimple URL | Chat iframe URL |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Widget position |
| `height` | `number \| string` | `400` | Chat window height |
| `width` | `number \| string` | `350` | Chat window width |
| `theme` | `'light' \| 'dark'` | `'light'` | Widget theme |
| `enabled` | `boolean` | `true` | Enable/disable widget |
| `title` | `string` | `'Chat Support'` | Widget title |
| `autoOpenDelay` | `number` | `undefined` | Auto-open delay in ms |
| `showUnreadIndicator` | `boolean` | `false` | Show unread indicator |

### InlineChat Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | ChatSimple URL | Chat iframe URL |
| `height` | `number \| string` | `500` | Chat height |
| `width` | `number \| string` | `'100%'` | Chat width |
| `title` | `string` | `'Live Chat Support'` | Chat title |
| `showHeader` | `boolean` | `true` | Show header bar |
| `showRefresh` | `boolean` | `true` | Show refresh button |

## Path-Based Configuration

The `ChatWidgetProvider` automatically handles different pages:

```typescript
// Default configuration in lib/chat/config.ts
export const defaultChatConfig = {
  disabledPaths: [
    '/admin',      // Disabled on admin pages
    '/api',        // Disabled on API routes
    '/checkout/thank-you', // Disabled on success pages
  ],
  autoOpenPaths: [
    '/support',    // Auto-opens on support page
    '/contact',    // Auto-opens on contact page
    '/help',       // Auto-opens on help page
  ],
};
```

## Experience Tracking

All chat interactions are automatically tracked:

- **Chat widget open/close**
- **Chat minimize/maximize**
- **Inline chat refresh**
- **Auto-open events**

Data is sent to your experience tracking system for analytics.

## Customization

### Custom Styling

```tsx
<ChatWidget 
  buttonClassName="!bg-red-500 !text-white hover:!bg-red-600"
  className="custom-chat-window"
/>
```

### Custom Icon

```tsx
import { HelpCircle } from 'lucide-react';

<ChatWidget 
  customIcon={<HelpCircle className="w-6 h-6" />}
/>
```

### Theme Customization

The widget respects your application's theme. For dark mode:

```tsx
<ChatWidget theme="dark" />
```

## Advanced Configuration

### Environment-Based Settings

```typescript
// lib/chat/config.ts
export function getChatConfig(): ChatConfig {
  const config = { ...defaultChatConfig };

  if (process.env.NODE_ENV === 'development') {
    config.autoOpen.enabled = false; // Disable auto-open in dev
  }

  if (process.env.NODE_ENV === 'production') {
    config.showUnreadIndicator = true; // Enable in production
  }

  return config;
}
```

### Dynamic Configuration

```tsx
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [chatConfig, setChatConfig] = useState(null);

  useEffect(() => {
    // Load user preferences
    const userPrefs = getUserPreferences();
    setChatConfig({
      theme: userPrefs.darkMode ? 'dark' : 'light',
      position: userPrefs.chatPosition || 'bottom-right',
    });
  }, []);

  return (
    <ChatWidgetProvider configOverride={chatConfig} />
  );
}
```

## Security Considerations

- The iframe uses appropriate `sandbox` attributes
- The ChatSimple URL is configured as a constant
- No sensitive data is passed through the iframe
- All interactions are tracked through experience tracking

## Performance Notes

- The widget lazy-loads the iframe content
- Loading states prevent user confusion
- Event tracking is debounced to prevent spam
- The widget respects "Do Not Track" settings

## Troubleshooting

### Widget not appearing
1. Check if `NEXT_PUBLIC_CHAT_WIDGET_ENABLED=true`
2. Verify you're not on a disabled path
3. Check browser console for errors

### Chat not loading
1. Verify the ChatSimple URL is correct
2. Check network tab for iframe loading issues
3. Ensure your domain is whitelisted in ChatSimple

### Styling issues
1. Check for CSS conflicts with global styles
2. Use specific class overrides if needed
3. Verify Tailwind classes are being applied

### Auto-open not working
1. Check if you're on an `autoOpenPaths` page
2. Verify localStorage isn't blocking new visitor detection
3. Check if user has "Do Not Track" enabled

## Integration Checklist

- [x] ✅ ChatWidget component created
- [x] ✅ ChatWidgetProvider with smart logic
- [x] ✅ InlineChat for embedded use
- [x] ✅ Configuration system with environment variables
- [x] ✅ Experience tracking integration
- [x] ✅ Path-based enable/disable logic
- [x] ✅ Auto-open functionality
- [x] ✅ Theme support (light/dark)
- [x] ✅ Loading states and error handling
- [x] ✅ Accessibility features
- [x] ✅ Mobile responsive design
- [x] ✅ Contact page integration
- [x] ✅ Global layout integration

Your ChatSimple widget is now fully integrated and ready to use! 🎉