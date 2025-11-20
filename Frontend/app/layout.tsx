import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpinnerProvider } from "@/components/ui/GlobalSpinner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartLibrary",
  description: "Your path to success",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Razorpay SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        {/* Explicit favicon to avoid the browser implicitly requesting /favicon.ico */}
        <link rel="icon" href="/placeholder-logo.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SpinnerProvider>
            {children}
            <Toaster />
          </SpinnerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
