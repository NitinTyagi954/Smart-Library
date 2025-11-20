import { SubscriptionManager } from "@/components/library/subscription-manager"

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your library subscription and choose the plan that works best for you.
            </p>
          </div>
          <SubscriptionManager />
        </div>
      </main>
    </div>
  )
}