"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { api } from "@/lib/api"
import { usePathname } from "next/navigation"

type User = { name: string; email: string; role?: string }

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Try API
        const resp = await api.get<{ success: boolean; data: { user: User } }>("/auth/me")
        if (!cancelled) setUser(resp.data.user)
      } catch {
        // Fallback localStorage (if you stored it after login)
        if (!cancelled) {
          try {
            const lsUser = localStorage.getItem("user")
            if (lsUser) setUser(JSON.parse(lsUser))
          } catch {}
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    try { await api.post("/auth/logout") } catch {}
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  const handleAnchorClick =
    (id: string, closeMenu = false) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault()
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      if (closeMenu) setIsMenuOpen(false)
    }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-sans font-bold text-xl text-foreground">SmartLibrary</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#home" onClick={handleAnchorClick("home")} className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/#about" onClick={handleAnchorClick("about")} className="text-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/#contact" onClick={handleAnchorClick("contact")} className="text-foreground hover:text-primary transition-colors">Contact</Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {!loading && user && (
                <>
                  <span className="text-sm">Hi, {user.name.split(" ")[0]}</span>
                  <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </>
              )}
              {!loading && !user && (
                <>
                  <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
                  <Button asChild><Link href="/signup">Sign Up</Link></Button>
                </>
              )}
              {loading && <span className="text-sm opacity-70">...</span>}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2">
              <Link href="/#home" onClick={handleAnchorClick("home", true)} className="block px-3 py-2">Home</Link>
              <Link href="/#about" onClick={handleAnchorClick("about", true)} className="block px-3 py-2">About</Link>
              <Link href="/#contact" onClick={handleAnchorClick("contact", true)} className="block px-3 py-2">Contact</Link>
              <div className="flex flex-col space-y-2 px-3 pt-2">
                {!loading && user && (
                  <>
                    <Button asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href={user.role === "admin" ? "/admin" : "/library"}>
                        {user.role === "admin" ? "Admin" : "Library"}
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => { setIsMenuOpen(false); handleLogout() }}>
                      Logout
                    </Button>
                  </>
                )}
                {!loading && !user && (
                  <>
                    <Button variant="outline" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
                {loading && <span className="text-sm px-1 py-2 opacity-70">Loading...</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
