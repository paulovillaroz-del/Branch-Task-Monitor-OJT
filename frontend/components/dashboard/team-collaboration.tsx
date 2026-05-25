"use client"

import { useState, useEffect } from "react"
import { Users, Briefcase, Mail, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StaffTaskView } from "./staff-task-view"

export function TeamCollaboration() {
  const [staffs, setStaffs] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<{email: string, name: string} | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    fetch("http://localhost:40241/users?role=user")
      .then(res => res.json())
      .then(data => setStaffs(data))
      .catch(err => console.error("Error fetching staff:", err))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Grid - Dito lang tayo mag-fo-focus sa directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffs.length > 0 ? (
          staffs.map((staff) => (
            <div
              key={staff.email}
              onClick={() => {
                setSelectedStaff({ email: staff.email, name: staff.full_name });
                setIsViewOpen(true);
              }}
              className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-14 h-14 border-2 border-slate-50 shadow-inner">
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 font-black text-lg">
                    {staff.full_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900">{staff.full_name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <Mail className="w-3 h-3" /> {staff.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   ACTIVE
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400" /> 
                  {staff.active_tasks || 0} tasks
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest col-span-full text-center py-10">
            No staff members found
          </p>
        )}
      </div>

      <StaffTaskView 
        open={isViewOpen} 
        onOpenChange={setIsViewOpen}
        email={selectedStaff?.email || ""}
        fullName={selectedStaff?.name || ""}
      />
    </div>
  )
}