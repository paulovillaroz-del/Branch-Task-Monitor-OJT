"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" 
import { User, Save, ShieldCheck } from "lucide-react"

function SettingsContent() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [oldEmail, setOldEmail] = useState("")
  const [role, setRole] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || ""
    const storedEmail = localStorage.getItem("userEmail") || ""
    const storedRole = localStorage.getItem("userRole") || "user"
    
    setFullName(storedName)
    setEmail(storedEmail)
    setOldEmail(storedEmail)
    setRole(storedRole)
  }, [])

  const handleSave = async () => {
    if (!email || !fullName) {
      alert("Please fill in all fields")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("http://localhost:8080/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_email: oldEmail,
          new_email: email,
          full_name: fullName
        }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("userName", data.full_name)
        localStorage.setItem("userEmail", data.email)
        setOldEmail(data.email)
        
        alert("Success: Profile updated!")
        window.location.reload() 
      } else {
        alert(data.error || "Update failed")
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Backend server is offline")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and contact email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-secondary/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-secondary/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Account Role</p>
              <p className="text-xs text-muted-foreground italic">You are currently logged in as {role}</p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize px-4 py-1">
            {role}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  // --- ADDED STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      {/* --- UPDATED SIDEBAR --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-3 md:p-4 lg:p-5 transition-all duration-300">
        {/* --- UPDATED HEADER (Handshake Active) --- */}
        <Header 
          title="Settings" 
          description="Manage your account preferences and settings." 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="mt-6">
          <SettingsContent />
        </div>
      </main>

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}