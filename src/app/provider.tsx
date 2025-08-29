// app/provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// 캐시 버전(스키마/단위 바뀌면 올려서 캐시 무효화)
const CACHE_BUSTER = "v1";

export default function Providers({ children }: { children: ReactNode }) {
  // QueryClient는 클라이언트에서 1회만 생성
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      })
  );

  // Next의 SSR 단계에서는 window가 없으므로, 클라이언트에서만 persister 생성
  const persister =
    typeof window !== "undefined"
      ? createSyncStoragePersister({
          storage: window.localStorage,
          key: `rq-cache:${CACHE_BUSTER}`,
        })
      : undefined;

  // persister가 준비되기 전에는 일반 Provider로 한 번 감싸준다
  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 6
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
