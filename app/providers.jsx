'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,   // data is fresh for 5 min — no refetch on tab switch
        gcTime: 10 * 60 * 1000,     // keep in cache 10 min after unmount
      }
    }
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}