"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: fullName, 
          email, 
          password,
          role: "user" 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login')
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Cannot connect to server. Is Go running?")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Brand Identity - Uses 'primary' to match Login icon */}
      <div className="mb-8 text-center space-y-3">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mx-auto shadow-xl shadow-primary/20 animate-in zoom-in duration-500">
          <UserPlus className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Monitor</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium text-emerald-900/60">Create Branch Staff Account</p>
        </div>
      </div>

      <Card className="max-w-[400px] w-full shadow-2xl border-border/50 bg-card">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Staff Sign Up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to create your branch account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="staff@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/30 border-none h-11 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {/* FIXED LOGIC: Show EyeOff when visible (to hide), Eye when hidden (to show) */}
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200 font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button - Uses 'primary' to match Login button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 py-6 text-sm font-bold shadow-lg shadow-primary/20 gap-2 transition-all active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-border/50 mt-4">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={() => router.push('/login')} 
                className="text-primary hover:underline font-bold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-40">
        © 2026 BRANCH TASK MONITORING SYSTEM
      </p>
    </div>
  )
}