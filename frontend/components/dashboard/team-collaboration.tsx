"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, Mail, Phone, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StaffTaskView } from "./staff-task-view"

export function TeamCollaboration() {
  const [staffs, setStaffs] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<{email: string, name: string} | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Fetch real staff data from your Go Backend
  useEffect(() => {
    fetch("http://localhost:8080/users?role=user")
      .then(res => res.json())
      .then(data => setStaffs(data))
      .catch(err => console.error("Error fetching staff:", err))
  }, [])

  return (
    <div className="space-y-6">
      <Card className="p-6 transition-all duration-500 shadow-sm border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-foreground">Active Staff Members</h2>
          </div>
          
          {/* FIX: Removed the 'Add Member' Button from here 
            because it is now handled by the Header actions in app/team/page.tsx 
          */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staffs.length > 0 ? (
            staffs.map((staff) => (
              <div
                key={staff.email}
                onClick={() => {
                  setSelectedStaff({ email: staff.email, name: staff.full_name });
                  setIsViewOpen(true);
                }}
                className="flex flex-col p-4 rounded-xl border border-border/40 bg-card hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 ring-2 ring-emerald-500/10 group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                      {staff.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{staff.full_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tighter">
                      {staff.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/30">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black uppercase tracking-widest">
                    Active
                  </Badge>
                  
                  {/* Updated to use 'active_tasks' from your backend response */}
                  <Badge 
                    variant="outline" 
                    className="text-[10px] font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors border-emerald-200/50"
                  >
                    <Briefcase className="w-3 h-3 mr-1" />
                    {staff.active_tasks || 0} In Progress
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center border-2 border-dashed rounded-xl border-muted/30">
               <p className="text-muted-foreground italic text-sm">No staff members found.</p>
            </div>
          )}
        </div>
      </Card>

      {/* The Slide-out Task View Component */}
      <StaffTaskView 
        open={isViewOpen} 
        onOpenChange={setIsViewOpen}
        email={selectedStaff?.email || ""}
        fullName={selectedStaff?.name || ""}
      />
    </div>
  )
}