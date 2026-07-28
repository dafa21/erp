
import React from 'react';
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MonitorPlay } from 'lucide-react';

// Expose globally to safe-shield any dynamic evaluations or runtime rendering
(window as any).MonitorPlay = MonitorPlay;

// Required for Google Drive Backup API
const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || 'UNCONFIGURED_CLIENT_ID';

// Configure secure global fetch interceptor to automatically attach authorization headers
// for nested modules and core operations (COA, Jurnal, etc.)
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: async function (input: RequestInfo | URL, init?: RequestInit) {
      let nhcUser: any = null;
      try {
        const raw = localStorage.getItem('nhc_user');
        if (raw) {
          nhcUser = JSON.parse(raw);
        }
      } catch (e) {
        // Silent catch
      }

      let finalInit: RequestInit = init || {};
      if (nhcUser && nhcUser.id && nhcUser.role) {
        const headers = new Headers(finalInit.headers || {});
        if (!headers.has('X-User-Id')) {
          headers.set('X-User-Id', String(nhcUser.id));
        }
        if (!headers.has('X-User-Role')) {
          headers.set('X-User-Role', String(nhcUser.role));
        }
        finalInit = {
          ...finalInit,
          headers
        };
      }
      return originalFetch.call(window, input, finalInit);
    }
  });
} catch (err) {
  console.error("Global safety fetch intercept failed:", err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ErrorBoundary><App /></ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if ((import.meta as any).env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    } else {
      // In development, unregister any active service worker to prevent aggressive caching of Vite dev modules
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister().then(unregistered => {
            if (unregistered) {
              console.log('SW unregistered in development mode:', registration.scope);
            }
          });
        }
      });
      // Clear all caches in development to solve stale dev asset loops
      if ('caches' in window) {
        caches.keys().then(names => {
          for (const name of names) {
            caches.delete(name).then(() => {
              console.log('Cache cleared in development:', name);
            });
          }
        });
      }
    }
  });
}
