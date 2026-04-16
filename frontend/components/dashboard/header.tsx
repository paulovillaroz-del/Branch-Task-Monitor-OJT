"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Bell, Menu, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  onSearch?: (term: string) => void
  onMenuClick?: () => void 
}

export function Header({ 
  title = "", 
  description = "", 
  actions, 
  onSearch, 
  onMenuClick 
}: HeaderProps) {
  const [userName, setUserName] = useState<string>("Guest")
  const [userEmail, setUserEmail] = useState<string>("")
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const storedEmail = localStorage.getItem("email") 
    if (storedName) setUserName(storedName)
    if (storedEmail) setUserEmail(storedEmail)
  }, [])

  // --- NOTIFICATION FETCH LOGIC ---
  useEffect(() => {
    if (!userEmail) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8080/notifications?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [userEmail]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="px-4 py-3 md:px-6 md:py-4 animate-slide-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            type="button"
            onClick={() => onMenuClick?.()} 
            className="lg:hidden h-9 w-9 shrink-0 hover:bg-secondary active:scale-95 transition-all border border-border/50"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search task..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-9 pr-3 h-9 text-sm bg-card border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-1 text-right">
            <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[120px]">{userEmail}</p>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
              <Mail className="w-4 h-4" />
            </Button>
            
            {/* --- FUNCTIONAL NOTIFICATION BELL --- */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-secondary rounded-full transition-all">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4 shadow-2xl border-border/50 bg-card overflow-hidden" align="end">
                <div className="p-3 border-b border-border bg-secondary/20 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Alerts & Notifications</h3>
                  {unreadCount > 0 && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">New</span>}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-border/30 last:border-0 hover:bg-secondary/10 transition-colors flex gap-3 ${!n.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="mt-0.5">
                          {n.message.includes("Approved") ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : n.message.includes("requesting") ? (
                            <Clock className="w-4 h-4 text-blue-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-foreground leading-tight">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto opacity-10 mb-2" />
                      <p className="text-[10px] italic font-medium uppercase tracking-widest">No Recent Alerts</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Avatar className="w-8 h-8 md:w-9 md:h-9 ring-2 ring-primary/20 border border-background shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight">{title}</h1>
        {description && <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>

      {actions && <div className="flex gap-2 mt-2">{actions}</div>}
    </header>
  )
}