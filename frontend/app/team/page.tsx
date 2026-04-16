'use client';

import { useState } from 'react';
// 1. Ensure these imports are correct
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { TeamCollaboration } from "@/components/dashboard/team-collaboration"; 
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TeamPage() {
  // 2. Add the state to control the sidebar on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // 3. Wrapper for full-screen layout and mobile stability
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      
      {/* 4. The Sidebar with state props */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 5. Main content area with desktop margin (lg:ml-64) */}
      <main className="flex-1 w-full min-w-0 lg:ml-64 p-3 md:p-6 lg:p-8 animate-in fade-in duration-500">
        <Header
          title="Team Management"
          description="View and manage your branch staff members."
          
          // 6. THE HANDSHAKE: This makes the hamburger menu appear on mobile
          onMenuClick={() => setIsSidebarOpen(true)}
          
          // Optional: Add a button to the header actions if you want it there
          actions={
            <Button className="gap-2 bg-primary hover:bg-primary/90 hidden md:flex">
              <Plus className="w-4 h-4" /> Add Member
            </Button>
          }
        />

        <div className="mt-8">
          {/* 7. Your existing team list component */}
          <TeamCollaboration />
        </div>
      </main>

      {/* 8. Mobile Background Overlay (Dims screen when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}