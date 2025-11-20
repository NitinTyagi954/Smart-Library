"use client"

import React, { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Send, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function FeedbackForm() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const saveTestimonialToLocal = (testimonial: any) => {
    try {
      const key = "testimonials"
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : []
      existing.unshift(testimonial)
      localStorage.setItem(key, JSON.stringify(existing))
      window.dispatchEvent(new Event("testimonials-updated"))
    } catch {}
  }

  const saveFeedbackFallback = (feedback: any) => {
    try {
      const key = "feedbacks"
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : []
      existing.unshift(feedback)
      localStorage.setItem(key, JSON.stringify(existing))
      // optional event:
      window.dispatchEvent(new Event("feedbacks-updated"))
    } catch {}
  }

  const genId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      try {
        // @ts-ignore
        return crypto.randomUUID()
      } catch {}
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      id: genId(),
      name: formData.name || "Anonymous",
      email: formData.email || "",
      category: formData.category,
      subject: formData.subject || "",
      message: formData.message || "",
      rating: rating || 0,
      timestamp: Date.now(),
    }

    if (formData.category === "general") {
      const testimonial = {
        id: payload.id,
        name: payload.name,
        rating: payload.rating,
        content: payload.message || payload.subject || "",
        subject: payload.subject || undefined,
        role: "Guest User",
        company: "Independent",
        timestamp: payload.timestamp,
      }
      saveTestimonialToLocal(testimonial)
    } else {
      // send to backend to email admin
      try {
        const backend = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || "http://localhost:5000"
        const res = await fetch(`${backend}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error("Failed to send feedback to server")
        }
      } catch (err) {
        // fallback: store locally
        saveFeedbackFallback(payload)
      }
    }

    setTimeout(() => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and get back to you soon.",
      })

      setFormData({
        name: "",
        email: "",
        category: "general",
        subject: "",
        message: "",
      })
      setRating(0)
      setIsSubmitting(false)
    }, 800)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const categories = [
    { value: "general", label: "General Feedback" },
    { value: "facilities", label: "Facilities & Infrastructure" },
    { value: "services", label: "Library Services" },
    { value: "staff", label: "Staff & Support" },
    { value: "suggestion", label: "Suggestions" },
    { value: "complaint", label: "Complaint" },
  ]

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Share Your Feedback
          </CardTitle>
          <p className="text-muted-foreground">
            Your feedback helps us improve our services and create a better learning environment for everyone.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating > 0 && `${rating} out of 5 stars`}</span>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please share your detailed feedback, suggestions, or concerns..."
                rows={6}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Email Support</h4>
              <p className="text-sm text-muted-foreground mb-1">For detailed inquiries or technical issues</p>
              <p className="text-sm font-medium text-primary">support@ultimatesuccessinstitute.com</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Phone Support</h4>
              <p className="text-sm text-muted-foreground mb-1">Available Monday to Friday, 9 AM - 6 PM</p>
              <p className="text-sm font-medium text-primary">+91 98765 43210</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">How quickly will I receive a response?</h4>
              <p className="text-sm text-muted-foreground">
                We typically respond to feedback within 24-48 hours during business days.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Can I submit anonymous feedback?</h4>
              <p className="text-sm text-muted-foreground">
                While we prefer to have contact information to follow up, you can submit feedback anonymously by using a
                temporary email.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">What happens after I submit feedback?</h4>
              <p className="text-sm text-muted-foreground">
                Our team reviews all feedback carefully. We'll acknowledge receipt and provide updates on any actions
                taken based on your input.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
