'use client';

import { TeamCollaboration } from "@/components/dashboard/team-collaboration"; 
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="w-full animate-in fade-in duration-500 p-8">
      {/* SECTION HEADER - Ito ay hindi na yung global Header component */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor branch staff members.</p>
        </div>
        
        <Button className="h-10 px-6 bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      {/* TEAM COLLABORATION - Directory Grid */}
      <div className="w-full">
        <TeamCollaboration />
      </div>
    </div>
  );
}