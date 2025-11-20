"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem("testimonials")
      const stored = raw ? JSON.parse(raw) : []
      stored.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
      setTestimonials(stored.slice(0, 5))
      setCurrentIndex(0)
    } catch {
      setTestimonials([])
    }
  }

  useEffect(() => {
    // only run on client
    setMounted(true)
    loadFromStorage()

    const handler = () => loadFromStorage()
    window.addEventListener("testimonials-updated", handler)

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "testimonials") loadFromStorage()
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      window.removeEventListener("testimonials-updated", handler)
      window.removeEventListener("storage", storageHandler)
    }
  }, [])

  const nextTestimonial = () => {
    if (testimonials.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    if (testimonials.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // avoid rendering different HTML on server vs client
  if (!mounted) return null
  if (!testimonials || testimonials.length === 0) return null

  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Student Testimonials</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our students — recent submissions appear here.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Quote className="h-8 w-8 text-primary mb-4 mx-auto" />
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </p>

                <div className="flex items-center justify-center mb-4">
                  {[...Array(testimonials[currentIndex].rating || 0)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">{testimonials[currentIndex].name}</h4>
                  {(testimonials[currentIndex].role || testimonials[currentIndex].company) && (
                    <p className="text-sm text-muted-foreground">
                      {testimonials[currentIndex].role ?? ""}{testimonials[currentIndex].role && testimonials[currentIndex].company ? " at " : ""}{testimonials[currentIndex].company ?? ""}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 gap-4">
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
