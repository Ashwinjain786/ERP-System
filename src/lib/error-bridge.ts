/**
 * ERROR BRIDGE - RUNTIME TELEMETRY & ERROR INTERCEPTOR
 * Automatically captures uncaught exceptions, promise rejections, console logs,
 * resource load failures, React error boundaries, and Potemkin UI silent failures.
 */

export type RuntimeErrorType = 
  | 'runtime_error'
  | 'unhandled_rejection'
  | 'console_error'
  | 'resource_error'
  | 'react_error'
  | 'silent_failure';

export interface RuntimeErrorEvent {
  type: RuntimeErrorType;
  message: string;
  stack?: string;
  filename?: string;
  line?: number;
  column?: number;
  timestamp: number;
  route?: string;
  componentStack?: string;
  details?: Record<string, any>;
}

declare global {
  interface Window {
    __RUNTIME_ERRORS__?: RuntimeErrorEvent[];
    __FARCL_ERROR_BRIDGE__?: {
      getErrors: () => RuntimeErrorEvent[];
      clearErrors: () => void;
      addError: (error: Omit<RuntimeErrorEvent, 'timestamp'>) => void;
    };
  }
}

const errors: RuntimeErrorEvent[] = [];
if (typeof window !== 'undefined') {
  window.__RUNTIME_ERRORS__ = errors;
}

export function addRuntimeError(event: Omit<RuntimeErrorEvent, 'timestamp'>) {
  const fullEvent: RuntimeErrorEvent = {
    ...event,
    timestamp: Date.now(),
    route: event.route || (typeof window !== 'undefined' ? window.location.pathname : undefined)
  };
  errors.push(fullEvent);
  if (typeof window !== 'undefined') {
    window.__RUNTIME_ERRORS__ = errors;
  }
}

export function getRuntimeErrors(): RuntimeErrorEvent[] {
  return [...errors];
}

export function clearRuntimeErrors(): void {
  errors.length = 0;
  if (typeof window !== 'undefined') {
    window.__RUNTIME_ERRORS__ = errors;
  }
}

export function logReactError(error: Error, errorInfo?: { componentStack?: string | null }) {
  addRuntimeError({
    type: 'react_error',
    message: error.message || String(error),
    stack: error.stack,
    componentStack: errorInfo?.componentStack || undefined
  });
}

export function initErrorBridge() {
  if (typeof window === 'undefined') return;
  const bridgeInit = (window as unknown as Record<string, unknown>).__FARCL_BRIDGE_INIT__;
  if (bridgeInit) return;
  (window as unknown as Record<string, unknown>).__FARCL_BRIDGE_INIT__ = true;

  window.__FARCL_ERROR_BRIDGE__ = {
    getErrors: getRuntimeErrors,
    clearErrors: clearRuntimeErrors,
    addError: addRuntimeError
  };

  // 1. window.onerror: Uncaught exceptions
  const prevOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    addRuntimeError({
      type: 'runtime_error',
      message: typeof message === 'string' ? message : (error?.message || 'Uncaught Error'),
      stack: error?.stack,
      filename: source,
      line: lineno,
      column: colno
    });
    if (typeof prevOnError === 'function') {
      return prevOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  // 2. unhandledrejection: Failed promises
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    addRuntimeError({
      type: 'unhandled_rejection',
      message: reason instanceof Error ? reason.message : (typeof reason === 'string' ? reason : 'Unhandled Promise Rejection'),
      stack: reason instanceof Error ? reason.stack : undefined
    });
  });

  // 3. console.error & console.warn monkey-patching
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      const msg = args.map(a => (a instanceof Error ? a.stack || a.message : (typeof a === 'object' ? JSON.stringify(a) : String(a)))).join(' ');
      if (!/Download the React DevTools|favicon\.ico/i.test(msg)) {
        addRuntimeError({
          type: 'console_error',
          message: msg.slice(0, 1000)
        });
      }
    } catch {}
    origConsoleError.apply(console, args);
  };

  // 4. Resource load errors (capture phase on window)
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement | null;
    if (target && target !== window) {
      const src = (target as any).src || (target as any).href || '';
      const tag = target.tagName ? target.tagName.toLowerCase() : 'element';
      addRuntimeError({
        type: 'resource_error',
        message: `Failed to load ${tag} resource: ${src}`,
        filename: src
      });
    }
  }, true);
}

// Auto-run on import
if (typeof window !== 'undefined') {
  initErrorBridge();
}
