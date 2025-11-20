"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, X, Home, CheckSquare, TrendingUp, CreditCard, MessageSquare, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { api } from "@/lib/api"

export function LibraryNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout")
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  const navItems = [
    { href: "/library", label: "Dashboard", icon: Home },
    { href: "/library/todos", label: "Daily Goals", icon: CheckSquare },
    { href: "/library/progress", label: "Progress", icon: TrendingUp },
    { href: "/library/subscription", label: "Subscription", icon: CreditCard },
    { href: "/library/feedback", label: "Feedback & Support", icon: MessageSquare },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/library" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-sans font-bold text-xl text-foreground">Library Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Main site link to root (added) */}
            <Link
              href="/"
              className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-1 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* Main site link in mobile menu (added) */}
              <Link
                href="/"
                className="flex items-center space-x-2 px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Main Site</span>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start mt-2 mx-3 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
