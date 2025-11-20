import type React from "react"
import { LibraryNavbar } from "@/components/library/library-navbar"

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <main>{children}</main>
    </div>
  )
}
