"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Lock, KeyRound } from "lucide-react"
import { ChangePasswordModal } from "./change-password-modal"

export default function SettingsPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Kinukuha ang data mula sa localStorage para i-display
    const storedName = localStorage.getItem("userName") || localStorage.getItem("full_name") || "Guest"
    const storedEmail = localStorage.getItem("userEmail") || localStorage.getItem("email") || "No email detected"
    
    setFullName(storedName)
    setEmail(storedEmail)
  }, [])

  return (
    // h-screen at overflow-hidden para hindi na mag-scroll ang website
    <div className="w-full h-screen overflow-hidden bg-white animate-in fade-in duration-500 flex flex-col">
      {/* Header na walang search bar */}
      <Header 
        title="Settings" 
        description="Manage your account preferences and security." 
      />
      
      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        <div className="max-w-4xl space-y-6">
          
          {/* Profile Card - Locked/Read-Only View */}
          <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4 bg-white">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs">
                View your account details below. These are managed by the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 bg-white">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Full Name
                </Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  disabled 
                  className="bg-gray-50 border-none cursor-not-allowed font-medium text-foreground opacity-100 h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="bg-gray-50 border-none cursor-not-allowed font-medium text-foreground opacity-100 h-10" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Card - Main Action */}
          <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4 bg-white">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Lock className="w-5 h-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Keep your account safe by updating your password regularly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 bg-white">
              <Button 
                onClick={() => setIsModalOpen(true)} 
                variant="outline" 
                className="border-primary/40 text-primary hover:bg-primary/5 gap-2 h-10 px-6 rounded-xl transition-all font-medium"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Hiwalay na Modal Component para sa Change Password Logic */}
      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userEmail={email} 
      />
    </div>
  )
}