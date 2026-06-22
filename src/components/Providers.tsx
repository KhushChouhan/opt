'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import SmoothScroll from './SmoothScroll';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <SmoothScroll />
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
