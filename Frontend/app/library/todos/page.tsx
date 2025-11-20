import { TodoManager } from "@/components/library/todo-manager"

export default function TodosPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Daily Goals</h1>
            <p className="text-muted-foreground">
              Set and track your daily learning objectives to stay focused and motivated.
            </p>
          </div>
          <TodoManager />
        </div>
      </main>
    </div>
  )
}
