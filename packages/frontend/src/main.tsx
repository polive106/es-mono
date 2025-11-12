import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { UseCaseProvider } from './providers/UseCaseProvider';
import './i18n/config'; // Initialize i18n
import './index.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UseCaseProvider>
        <RouterProvider router={router} />
      </UseCaseProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
