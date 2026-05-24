'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { SessionProvider } from 'next-auth/react'

// import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ Wrap other providers here as needed */}
      <SessionProvider> 
      {/* <ThemeProvider> */}
      {children}
      {/* </ThemeProvider> */}
      </SessionProvider> 
    </QueryClientProvider>
  )
}