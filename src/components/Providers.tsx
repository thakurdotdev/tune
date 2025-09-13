'use client';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactNode } from 'react';
import { AudioPlayerProvider } from 'react-use-audio-player';
import BottomPlayer from './music/BottomPlayer';
import PlayerProvider from './PlayerProvider';
import { Toaster } from './ui/sonner';

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: 'always',
      retry: 1,
      gcTime: Infinity,
      staleTime: Infinity,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? localStorage : undefined,
});

export function Providers({ children }: ProvidersProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AudioPlayerProvider>
        <PlayerProvider>
          <Toaster />
          {children}
          <BottomPlayer />
        </PlayerProvider>
      </AudioPlayerProvider>
    </PersistQueryClientProvider>
  );
}
