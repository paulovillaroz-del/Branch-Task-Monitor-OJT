'use client';

import { StatsCards } from "@/components/dashboard/stats-cards";
import { Reminders } from "@/components/dashboard/reminders";
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list";
import { LayoutDashboard } from "lucide-react";

interface AdminDashboardProps {
  tasks: any[];
  loading: boolean;
  userName: string;
}

export function AdminDashboard({ tasks, loading, userName }: AdminDashboardProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">
          Welcome Back, <span className="text-emerald-700">{userName}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* StatsCards */}
        <StatsCards tasks={tasks} loading={loading} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Task List para sa Admin */}
          <div className="xl:col-span-2 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-1 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-emerald-700" />
                <h2 className="font-bold text-gray-800">System Task Overview</h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                Admin Mode
              </span>
            </div>
            <DashboardTaskList tasks={tasks} />
          </div>

          {/* Sidebar - Reminders lang ang natira */}
          <div className="space-y-6">
            <Reminders tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}