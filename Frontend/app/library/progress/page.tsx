import { ProgressTracker } from "@/components/library/progress-tracker"

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Progress Tracker</h1>
            <p className="text-muted-foreground">Visualize your learning journey and maintain your study streak.</p>
          </div>
          <ProgressTracker />
        </div>
      </main>
    </div>
  )
}
