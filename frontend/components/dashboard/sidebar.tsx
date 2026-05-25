"use client"

import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  UserCircle,
  ShieldAlert, 
  X,
  AlertCircle,
  MessageSquare,
  Activity,
  Megaphone,
  CheckCircle // <-- Para sa Task Status
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

// UI Components for Logout Confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ["admin", "user"] },
  { icon: CheckSquare, label: "Tasks", href: "/tasks", roles: ["admin", "user"] },
  { icon: Activity, label: "Audit Trail", href: "/calendar", roles: ["admin"] },
  { icon: ShieldAlert, label: "Monitor", href: "/monitor", roles: ["admin"] },
  { icon: CheckCircle, label: "Task Status", href: "/task-status", roles: ["admin"] }, // <-- BAGONG TASK STATUS
  { icon: BarChart3, label: "Analytics", href: "/analytics", roles: ["admin"] }, // <-- IBINALIK ANG ANALYTICS
  { icon: Users, label: "Team", href: "/team", roles: ["admin"] },
  { icon: Megaphone, label: "Announcements", href: "/announcements", roles: ["admin", "user"] },
]

const generalItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [role, setRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [taskCount, setTaskCount] = useState<number>(0)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // FIX: Added .toLowerCase() to prevent case-sensitivity issues like "Admin" vs "admin"
    const currentRole = (localStorage.getItem("userRole") || localStorage.getItem("role") || "user").toLowerCase();
    const currentEmail = localStorage.getItem("email");
    setRole(currentRole);
    setUserName(localStorage.getItem("userName") || "Guest");

    const fetchTaskCount = async () => {
      try {
        let url = `http://localhost:40241/tasks?t=${Date.now()}`;
        if (currentRole === "user" && currentEmail) {
          url += `&assigned_to=${encodeURIComponent(currentEmail)}`;
        }
        const res = await fetch(url, { cache: 'no-store' });
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) return; 
        const data = await res.json();
        if (Array.isArray(data)) setTaskCount(data.length);
      } catch (err) {
        console.error("Sidebar Badge Fetch Error:", err);
      }
    };

    fetchTaskCount();
    const interval = setInterval(fetchTaskCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmLogout = () => {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 lg:hidden transition-opacity duration-300",
          isOpen ? "z-[80] opacity-100 pointer-events-auto" : "z-[-1] opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* SIDEBAR ASIDE */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[9999] w-64 bg-card border-r border-border shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out flex flex-col p-4",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
        <div className="mb-8 px-2">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest px-2 py-1 bg-primary/10 rounded">
              Navigation
            </span>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-secondary rounded-full active:scale-90 transition-all"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
               <UserCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground leading-none mb-1 truncate">
                {role === "admin" ? "Admin Portal" : "Staff Portal"}
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight truncate">
                {userName}
              </p>
            </div>
          </div>
          <div className="h-px bg-border w-full mt-4" />
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 mb-3 uppercase tracking-widest px-2">Main Menu</p>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  if (role && !item.roles.includes(role)) return null;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose} 
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {item.label === "Tasks" && taskCount > 0 && (
                        <span className={cn(
                          "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                          isActive ? "bg-primary-foreground/20 text-white" : "bg-primary/10 text-primary"
                        )}>
                          {taskCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 mb-3 uppercase tracking-widest px-2">Account</p>
              <nav className="space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border mt-auto">
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card border-border/50 max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center font-bold text-xl uppercase tracking-tighter">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              Are you sure you want to log out? You will need to sign in again to access your dashboard and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto font-bold uppercase tracking-widest text-[10px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px]"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}