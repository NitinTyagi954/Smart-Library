import type React from "react"
import { AdminNavbar } from "@/components/admin/admin-navbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main>{children}</main>
    </div>
  )
}
