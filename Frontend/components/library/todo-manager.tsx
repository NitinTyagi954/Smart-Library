"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Check, X, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  priority: "low" | "medium" | "high"
}

const TODOS_KEY = "library-todos"
const LAST_TODO_DATE_KEY = "library-last-todo-date"
const PROGRESS_KEY = "progressData" // { "YYYY-MM-DD": boolean }

export function TodoManager() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
  })
  const { toast } = useToast()

  const todayStr = new Date().toISOString().split("T")[0]

  useEffect(() => {
    // Auto-reset todos each new day
    const lastSavedDate = localStorage.getItem(LAST_TODO_DATE_KEY)
    if (lastSavedDate !== todayStr) {
      localStorage.setItem(LAST_TODO_DATE_KEY, todayStr)
      localStorage.removeItem(TODOS_KEY)
      setTodos([])
      return
    }

    const savedTodos = localStorage.getItem(TODOS_KEY)
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos))
      } catch {
        setTodos([])
      }
    } else {
      setTodos([])
    }
  }, [todayStr])

  const saveTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos)
    localStorage.setItem(TODOS_KEY, JSON.stringify(updatedTodos))
  }

  const addTodo = () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your goal.",
        variant: "destructive",
      })
      return
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: newTodo.priority,
    }

    const updatedTodos = [...todos, todo]
    saveTodos(updatedTodos)
    setNewTodo({ title: "", description: "", priority: "medium" })
    setIsAddingTodo(false)

    toast({
      title: "Goal Added",
      description: "Your daily goal has been added successfully.",
    })
  }

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    saveTodos(updatedTodos)

    // After toggling, update progressData if needed
    updateProgressFromTodos(updatedTodos)

    const todo = todos.find((t) => t.id === id)
    toast({
      title: todo?.completed ? "Goal Unmarked" : "Goal Completed",
      description: todo?.completed ? "Keep working on it!" : "Great job! Keep up the momentum.",
    })
  }

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id)
    saveTodos(updatedTodos)
    updateProgressFromTodos(updatedTodos)

    toast({
      title: "Goal Deleted",
      description: "Your goal has been removed.",
    })
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    saveTodos(updatedTodos)
    setEditingTodo(null)
    updateProgressFromTodos(updatedTodos)

    toast({
      title: "Goal Updated",
      description: "Your goal has been updated successfully.",
    })
  }

  const updateProgressFromTodos = (currentTodos: Todo[]) => {
    // Only mark today's date completed when there is at least one todo
    // AND all todos are completed
    const allCompleted = currentTodos.length > 0 && currentTodos.every((t) => t.completed)

    const savedProgressRaw = localStorage.getItem(PROGRESS_KEY)
    const savedProgress = savedProgressRaw ? JSON.parse(savedProgressRaw) : {}

    // only update when value changes to avoid unnecessary events
    if (savedProgress[todayStr] !== allCompleted) {
      savedProgress[todayStr] = allCompleted
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress))
      // notify tracker to reload
      window.dispatchEvent(new Event("progress-update"))
    }
  }

  // Ensure progress is consistent on mount (for example: if user has pre-completed todos)
  useEffect(() => {
    updateProgressFromTodos(todos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{totalCount - completedCount}</p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Todo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Goals
            </span>
            <Button onClick={() => setIsAddingTodo(true)} disabled={isAddingTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAddingTodo && (
            <div className="space-y-4 mb-6 p-4 border border-border rounded-lg bg-card">
              <Input
                placeholder="Goal title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              <Textarea
                placeholder="Goal description (optional)"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
              <div className="flex items-center gap-4">
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={addTodo}>
                    <Check className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingTodo(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Todo List */}
          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No goals set for today. Add your first goal to get started!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 border rounded-lg transition-all ${
                    todo.completed ? "bg-muted/50 border-muted" : "bg-card border-border"
                  }`}
                >
                  {editingTodo === todo.id ? (
                    <EditTodoForm
                      todo={todo}
                      onSave={(updates) => updateTodo(todo.id, updates)}
                      onCancel={() => setEditingTodo(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {todo.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${
                              todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p
                              className={`text-sm mt-1 ${
                                todo.completed ? "line-through text-muted-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getPriorityColor(todo.priority)}>{todo.priority} priority</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTodo(todo.id)}
                          disabled={todo.completed}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EditTodoForm({
  todo,
  onSave,
  onCancel,
}: {
  todo: Todo
  onSave: (updates: Partial<Todo>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [priority, setPriority] = useState(todo.priority)

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title, description, priority })
  }

  return (
    <div className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goal description" />
      <div className="flex items-center gap-4">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
