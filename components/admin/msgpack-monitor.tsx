// This component has been removed because the underlying functions
// in lib/msgpack-loader.ts were removed during a refactoring.

export function MessagePackMonitor() {
  return null;
}

export function useMessagePackMonitor() {
  return {
    enableMonitor: () => {},
    disableMonitor: () => {},
    isEnabled: false,
  };
}
