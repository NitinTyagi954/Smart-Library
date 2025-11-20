import { ServiceSelection } from "@/components/auth/service-selection"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Ultimate Success Institute</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the service you'd like to access. Start your learning journey today!
          </p>
        </div>

        <ServiceSelection />

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
