/**
 * PROTECTED APPLICATION ROOT - DETERMINISTICALLY GENERATED
 * Do not modify this file manually.
 */
import './lib/error-bridge';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './app/router.generated';
import { setApiConfig } from './api/apiCall';
import './index.css';

setApiConfig({ baseUrl: '/api' });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
