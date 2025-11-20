"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Monitor, Users, ArrowRight } from "lucide-react"

type User = { name: string; email: string; role?: "admin" | "student" }

export function ServicesSection() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First try localStorage (faster)
        const ls = localStorage.getItem("user")
        if (ls) {
          const parsedUser = JSON.parse(ls)
          setUser(parsedUser)
          console.log("✅ User loaded from localStorage:", parsedUser)
        }

        // Then verify with API
        const resp = await api.get<{ success: boolean; data: { user: User } }>("/auth/me")
        if (resp.data.user) {
          setUser(resp.data.user)
          console.log("✅ User verified from API:", resp.data.user)
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(resp.data.user))
        }
      } catch (error) {
        console.log("⚠️ API verification failed, using localStorage data")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const services = [
    {
      icon: BookOpen,
      title: "Library Services",
      description:
        "Access our extensive collection of books, study materials, and quiet study spaces. Track your progress and achieve your learning goals.",
      features: ["5000+ Books", "Study Rooms", "Progress Tracking", "Daily Goals"],
      status: "active",
    },
    {
      icon: Monitor,
      title: "Computer Classes",
      description:
        "Learn essential computer skills, programming languages, and software applications with hands-on training.",
      features: ["Programming", "Software Training", "Hands-on Labs", "Certification"],
      status: "coming-soon",
    },
    {
      icon: Users,
      title: "Coaching Classes",
      description: "Personalized coaching sessions for competitive exams, career guidance, and skill development.",
      features: ["Personal Mentoring", "Exam Prep", "Career Guidance", "Skill Development"],
      status: "coming-soon",
    },
  ]

  const handleLibraryClick = () => {
    console.log("🔵 Library button clicked!")
    console.log("🔵 Current user state:", user)
    
    if (!user) {
      console.log("➡️ No user found, redirecting to /login")
      router.push("/login")
      return
    }

    console.log("🔵 User role:", user.role)
    
    if (user.role === "admin") {
      console.log("➡️ Admin user, redirecting to /admin")
      router.push("/admin")
    } else {
      console.log("➡️ Student user, redirecting to /library")
      router.push("/library")
    }
  }

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background to-card/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Our <span className="text-primary">Services</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose from our comprehensive suite of educational services designed to accelerate your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            const isLibraryService = service.title === "Library Services"
            
            return (
              <div key={index} className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isLibraryService 
                  ? "bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30 hover:border-primary/60" 
                  : "bg-card border border-border hover:border-primary/30"
              }`}>
                {/* Gradient background effect */}
                <div className={`absolute inset-0 -z-10 transition-opacity duration-300 ${
                  isLibraryService ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                </div>

                <div className="p-8">
                  {/* Header with Icon */}
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
                      isLibraryService 
                        ? "bg-primary/30" 
                        : "bg-card border border-border group-hover:bg-primary/10 group-hover:border-primary/30"
                    }`}>
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-foreground">
                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                          isLibraryService ? "bg-primary" : "bg-primary/50 group-hover:bg-primary"
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Status Badge */}
                  {!isLibraryService && (
                    <div className="mb-4 inline-block">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  
                  {/* Button */}
                  {isLibraryService ? (
                    <Button
                      className="w-full rounded-lg font-semibold transition-all duration-300 group-hover:shadow-lg"
                      onClick={handleLibraryClick}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-lg font-semibold"
                      variant="outline"
                      disabled
                    >
                      Available Soon
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
