"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Trophy, Sparkles, BookMarked, Target } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

type User = { name: string; email: string; role?: string }

export function HeroSection() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resp = await api.get<{ success: boolean; data: { user: User } }>("/api/auth/me")
        if (!cancelled) setUser(resp.data.user)
      } catch {
        // fallback localStorage if you still store user there
        if (!cancelled) {
          try {
            const ls = localStorage.getItem("user")
            if (ls) setUser(JSON.parse(ls))
          } catch {}
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleGetStarted = () => {
    if (user) {
      const el = document.getElementById("services")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        router.push("/#services")
      }
    } else {
      router.push("/signup")
    }
  }

  return (
    <section id="home" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left lg:text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Welcome to SmartLibrary</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Gateway to <span className="text-primary">Smart Learning</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Experience a revolutionary learning platform combining comprehensive library services, interactive computer classes, and personalized coaching—all in one smart ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 transition-all"
                onClick={handleGetStarted}
                disabled={loading}
              >
                {user ? "Explore Services" : "Get Started Today"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-8 py-6 rounded-full"
              >
                <a href="#about">Learn More</a>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <BookMarked className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">5000+ Resources</p>
                  <p className="text-xs text-muted-foreground">Curated learning materials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">2000+ Students</p>
                  <p className="text-xs text-muted-foreground">Active community</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">95% Success</p>
                  <p className="text-xs text-muted-foreground">Proven results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Award Winning</p>
                  <p className="text-xs text-muted-foreground">Industry recognized</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Stats Card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">5000+</p>
                        <p className="text-sm text-muted-foreground">Books Available</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-secondary/20 rounded-lg">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">2000+</p>
                        <p className="text-sm text-muted-foreground">Active Students</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent/20 rounded-lg">
                        <Trophy className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">95%</p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
