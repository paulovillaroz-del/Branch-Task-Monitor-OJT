'use client';

import { StatsCards } from "@/components/dashboard/stats-cards";
import { Reminders } from "@/components/dashboard/reminders";
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list";
import { CheckSquare } from "lucide-react";

interface StaffDashboardProps {
  tasks: any[];
  loading: boolean;
  userName: string;
}

export function StaffDashboard({ tasks, loading, userName }: StaffDashboardProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
    
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">
          Working as <span className="text-green-700">Staff Member: {userName}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <StatsCards tasks={tasks} loading={loading} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-1 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-2">
               <CheckSquare className="w-5 h-5 text-green-700" />
               <h2 className="font-bold text-gray-800">My Assigned Tasks</h2>
            </div>
            {/* Listahan ng trabaho ni Staff */}
            <DashboardTaskList tasks={tasks} />
          </div>

          <div className="space-y-6">
            <Reminders tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}