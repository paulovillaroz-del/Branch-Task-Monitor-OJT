"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function LogoutPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleLogout = async () => {
    setIsPending(true)
    
    // Helper function to clear all local branch data
    const clearSession = () => {
      localStorage.removeItem("loggedIn")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("token") // for future use
    }

    try {
      // 1. Call your GoLang backend (Optional: check if the route exists first)
      await fetch("http://localhost:40241/logout", {
        method: "POST",
        credentials: "include",
      })

      // 2. Clear frontend storage
      clearSession()

      // 3. Small artificial delay so the user sees the "Loader" (looks more professional)
      await new Promise(resolve => setTimeout(resolve, 600))

      // 4. Redirect to login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
      // Fallback: Clear storage anyway so user isn't stuck
      clearSession()
      router.push("/login")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar and Header stay visible for UI consistency */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header 
          title="Session Management" 
          description="Confirm your departure from the Monitoring System." 
        />

        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl border-border/50 bg-card">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
                <LogOut className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">End Session?</h1>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to log out? Any unsaved task descriptions may be lost.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleLogout}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, Log Out"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}