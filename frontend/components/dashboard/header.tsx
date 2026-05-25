"use client"

import { useState, useEffect } from "react"
import { Mail, Bell, Menu, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  onMenuClick?: () => void 
}

export function Header({ 
  actions, 
  onMenuClick 
}: HeaderProps) {
  const [userName, setUserName] = useState<string>("Guest")
  const [userEmail, setUserEmail] = useState<string>("")
  const [notifications, setNotifications] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUserName(localStorage.getItem("userName") || "Guest")
    setUserEmail(localStorage.getItem("email") || "")
  }, [])

  // --- OPTIMISTIC MARK AS READ ---
  const markAsRead = async (notificationId: number) => {
    // I-update agad ang UI (Optimistic Update)
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, is_read: true} : n));
    
    try {
      await fetch(`http://localhost:40241/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error("Failed to sync read status:", err);
    }
  };

  // --- NOTIFICATION FETCHING ---
  useEffect(() => {
    if (!userEmail) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:40241/notifications?email=${encodeURIComponent(userEmail)}`)
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Ginawang 15s para hindi masyadong madalas
    return () => clearInterval(interval);
  }, [userEmail]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!mounted) return null; 

  return (
    <header className="px-4 py-3 md:px-6 md:py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="lg:hidden h-9 w-9 border border-border/50"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Right Side: User & Notifications */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-black text-foreground">{userName}</p>
            <p className="text-[10px] text-muted-foreground">{userEmail}</p>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-background">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 shadow-xl border-border/50 bg-card overflow-hidden" align="end">
                <div className="p-3 border-b border-border bg-secondary/30">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Alerts & Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-4 cursor-pointer border-b last:border-0 flex gap-3 transition-colors ${!n.is_read ? 'bg-primary/5' : 'hover:bg-secondary/20'}`}
                      >
                        <div className="mt-1">
                          {n.message?.includes("Approved") ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold leading-tight">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-black mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-8 text-center text-[10px] uppercase font-bold text-muted-foreground">No alerts found</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Avatar className="w-8 h-8 ring-2 ring-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      {actions && <div className="mt-4">{actions}</div>}
    </header>
  )
}