"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import Link from "next/link"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const resp = await api.post<{
        success: boolean
        data?: { user?: { email: string; name: string; role: "admin" | "student" } }
        message?: string
        error?: string
      }>("/auth/login", {
        email: formData.email,
        password: formData.password,
      })

      // Your api.ts returns the parsed JSON directly (not Axios-style)
      const payload = resp as any
      const ok = payload?.success === true
      const user = payload?.data?.user

      if (!ok || !user) {
        const msg = payload?.message || payload?.error || "User does not exist or invalid credentials"
        setError(msg)
        toast({
          title: "Login failed",
          description: msg,
          variant: "destructive",
        })
        return
      }

      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${user.role === "admin" ? "admin dashboard" : "services"}...`,
      })

      // Cookies (access/refresh) are set by the API via Set-Cookie; api.ts already sends credentials: "include"
      // Redirect based on role
      router.push(user.role === "admin" ? "/admin" : "/services")
    } catch (err: any) {
      console.error("Login error:", err)
      const errorMessage =
        err?.response?.data?.message || err?.message || "Please check your email and password"
      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* 🔴 Error message yaha show hoga */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
