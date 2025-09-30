"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';

const DevToolsBlocker = () => {
  useEffect(() => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const devtools = { open: false, orientation: '' };
    const threshold = 160;
    let warned = false;

    // Detect devtools by monitoring window size changes
    const detectDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open && !warned) {
          devtools.open = true;
          warned = true;
          toast.warning('Developer tools detected', {
            description: 'Please close developer tools for security reasons.',
            duration: 10000,
          });
          console.clear();
          // Optionally redirect or take other action
          // window.location.href = '/blocked';
        }
      } else {
        devtools.open = false;
        warned = false;
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled', {
        description: 'This action is not allowed for security reasons.',
        duration: 3000,
      });
      return false;
    };

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input fields
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error('Developer tools are disabled');
        return false;
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev Tools)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        toast.error('Developer tools are disabled');
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        toast.error('View source is disabled');
        return false;
      }

      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        toast.error('Save is disabled');
        return false;
      }

      // Disable Ctrl+A (Select All) except in input fields
      if (e.ctrlKey && e.key.toUpperCase() === 'A') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          return false;
        }
      }
    };

    // Disable console methods
    const disableConsole = () => {
      const noop = () => {};
      type ConsoleMethod = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'trace' | 'table';
      const methods: ConsoleMethod[] = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'table'];
      methods.forEach((method) => {
        const originalMethod = console[method];
        if (typeof originalMethod === 'function') {
          console[method] = noop as typeof originalMethod;
        }
      });
    };

    // Detect debugger statement
    const detectDebugger = () => {
      const start = performance.now();
      // This will pause if debugger is open
      // debugger;
      const end = performance.now();
      if (end - start > 100) {
        toast.error('Debugger detected!', {
          description: 'Please close developer tools.',
          duration: 10000,
        });
      }
    };

    // Add CSS to disable text selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    // Set up event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Monitor for devtools
    const devToolsInterval = setInterval(detectDevTools, 500);
    const debuggerInterval = setInterval(detectDebugger, 5000);

    // Disable console in production
    disableConsole();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(devToolsInterval);
      clearInterval(debuggerInterval);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Add a warning overlay when devtools are detected
  return (
    <div 
      id="devtools-warning" 
      style={{ display: 'none' }}
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-lg max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Security Warning</h2>
        <p className="text-gray-700 mb-4">
          Developer tools have been detected. This action is not allowed for security reasons.
        </p>
        <p className="text-gray-700">
          Please close developer tools to continue using the application.
        </p>
      </div>
    </div>
  );
};

export default DevToolsBlocker;
