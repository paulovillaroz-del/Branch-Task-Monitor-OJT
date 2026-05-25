'use client';

import { useState } from 'react';
import { ProjectList } from "./project-list";
import { AlertCircle, Clock, Loader2 } from "lucide-react";

export function AdminTaskView({ tasks, fetchTasks }: { tasks: any[], fetchTasks: () => void }) {
  const [activeFilter, setActiveFilter] = useState<string>('all'); 

  const getCategory = (t: any) => {
    const s = String(t.status || "").toLowerCase();
    const fullTaskJson = JSON.stringify(t).toLowerCase();
    
    const isApproval = 
      s.includes('approv') || 
      s.includes('review') || 
      fullTaskJson.includes('review needed') || 
      fullTaskJson.includes('approval required') ||
      fullTaskJson.includes('for approval');

    const isInProgress = (s.includes('progress') || s.includes('working')) && !isApproval;

    if (isApproval) return 'approval';
    if (isInProgress) return 'inprogress';
    return 'pending';
  };

  const approvalTasks = tasks.filter(t => getCategory(t) === 'approval');
  const inProgressTasks = tasks.filter(t => getCategory(t) === 'inprogress');
  const pendingTasks = tasks.filter(t => getCategory(t) === 'pending');

  // Helper para sa section rendering
  const renderSection = (title: string, icon: React.ReactNode, taskList: any[], filterKey: string) => {
    if (taskList.length === 0 && activeFilter === filterKey) {
      return (
        <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          No tasks found in {title}.
        </div>
      );
    }
    if (taskList.length === 0) return null;

    return (
      <div className="animate-in fade-in duration-300">
        <h2 className={`text-[10px] font-black uppercase mb-3 px-2 flex items-center gap-2 ${
          filterKey === 'approval' ? 'text-orange-700' : 
          filterKey === 'inprogress' ? 'text-blue-700' : 'text-gray-500'
        }`}>
          {icon} {title}
        </h2>
        <ProjectList tasks={taskList} isEditable={true} onTaskUpdated={fetchTasks} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2">
        {[
          { id: 'all', label: 'All Active', count: tasks.length, color: 'bg-slate-800' },
          { id: 'approval', label: 'Needs Approval', count: approvalTasks.length, color: 'bg-orange-500' },
          { id: 'inprogress', label: 'In Progress', count: inProgressTasks.length, color: 'bg-blue-600' },
          { id: 'pending', label: 'Pending', count: pendingTasks.length, color: 'bg-gray-600' },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveFilter(tab.id)} 
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeFilter === tab.id 
                ? `${tab.color} text-white shadow-lg scale-105` 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* List content */}
      <div className="flex flex-col gap-10">
        {(activeFilter === 'all' || activeFilter === 'approval') && renderSection("Needs Approval", <AlertCircle className="w-3 h-3" />, approvalTasks, 'approval')}
        {(activeFilter === 'all' || activeFilter === 'inprogress') && renderSection("In Progress", <Loader2 className="w-3 h-3" />, inProgressTasks, 'inprogress')}
        {(activeFilter === 'all' || activeFilter === 'pending') && renderSection("Pending", <Clock className="w-3 h-3" />, pendingTasks, 'pending')}
      </div>
    </div>
  );
}