"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"

export function SettingsContent() {
  const { theme, setTheme } = useTheme()

  // 1. State for User Data
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [oldEmail, setOldEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 2. Load current data from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || ""
    const storedEmail = localStorage.getItem("userEmail") || ""
    setFullName(storedName)
    setEmail(storedEmail)
    setOldEmail(storedEmail) // Keep track of the original email to find the record in DB
  }, [])

  // 3. Handle Save Changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("http://localhost:8080/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_email: oldEmail,
          new_email: email,
          full_name: fullName,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Update LocalStorage so Sidebar/Header change immediately
        localStorage.setItem("userName", data.full_name)
        localStorage.setItem("userEmail", data.email)
        setOldEmail(data.email)
        
        alert("Success: Profile updated!")
        // Refresh to sync the Sidebar and Header UI
        window.location.reload()
      } else {
        alert(data.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Error: Backend server is offline")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Profile Information</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary/10">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                {fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Notifications</h3>
        <div className="space-y-4">
          {[
            { label: "Email notifications", description: "Receive email about your account activity" },
            { label: "Push notifications", description: "Receive push notifications in your browser" },
            { label: "Task reminders", description: "Get reminded about upcoming task deadlines" },
            { label: "Team updates", description: "Notifications about team member activities" },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={index < 2} />
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Enable dark mode theme</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
        </div>
      </Card>
    </div>
  )
}