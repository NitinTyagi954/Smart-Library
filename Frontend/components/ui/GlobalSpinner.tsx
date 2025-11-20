"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SpinnerContextType {
  isLoading: boolean
  show: () => void
  hide: () => void
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined)

export function SpinnerProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const show = () => setIsLoading(true)
  const hide = () => setIsLoading(false)

  return (
    <SpinnerContext.Provider value={{ isLoading, show, hide }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-white"></div>
        </div>
      )}
    </SpinnerContext.Provider>
  )
}

export function useGlobalSpinner() {
  const ctx = useContext(SpinnerContext)
  if (!ctx) throw new Error("useGlobalSpinner must be used inside SpinnerProvider")
  return ctx
}
