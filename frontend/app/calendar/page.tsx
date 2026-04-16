'use client'; // Added use client for state

import { useState } from 'react';
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CalendarContent } from "@/components/calendar/calendar-content"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-4 lg:p-6 transition-all duration-300">
        <Header
          title="Calendar"
          description="Schedule and track your events and meetings."
          onMenuClick={() => setIsSidebarOpen(true)} // Handshake Active
          actions={
            <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105">
              + Add Event
            </Button>
          }
        />

        <div className="mt-6">
          <CalendarContent />
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[80] lg:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}