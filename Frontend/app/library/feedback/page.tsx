import { FeedbackForm } from "@/components/library/feedback-form"

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Feedback & Support</h1>
            <p className="text-muted-foreground">
              Help us improve by sharing your thoughts and suggestions about our library services.
            </p>
          </div>
          <FeedbackForm />
        </div>
      </main>
    </div>
  )
}
