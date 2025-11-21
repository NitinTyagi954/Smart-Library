"use client"

import { GoogleLogin } from "@react-oauth/google"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function GoogleSignInButton() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true)
    try {
      const token = credentialResponse.credential

      // Send Google token to backend to verify and create/login user
      const resp = await api.post<{
        success: boolean
        data?: { user?: { email: string; name: string; role: "admin" | "student"; id: string } }
        message?: string
        error?: string
      }>("/auth/google-signin", {
        googleToken: token,
      })

      if (!resp.success || !resp.data?.user) {
        throw new Error(resp.message || "Google sign-in failed")
      }

      const user = resp.data.user

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Success!",
        description: `Welcome ${user.name}!`,
      })

      // Redirect based on role
      setTimeout(() => {
        router.push(user.role === "admin" ? "/admin" : "/services")
      }, 500)
    } catch (err: any) {
      console.error("Google sign-in error:", err)
      toast({
        title: "Sign-in failed",
        description: err.message || "Failed to sign in with Google",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    toast({
      title: "Google sign-in failed",
      description: "Failed to sign in with Google. Please try again.",
      variant: "destructive",
    })
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center p-3">
          <Loader2 className="animate-spin h-5 w-5" />
        </div>
      ) : (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="300"
          />
        </div>
      )}
    </div>
  )
}
