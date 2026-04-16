'use client'; // Added this since we need state

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"

export default function HelpPage() {
  // --- ADDED STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      {/* --- UPDATED SIDEBAR --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-4 lg:p-6 transition-all duration-300">
        {/* --- UPDATED HEADER (Handshake Active) --- */}
        <Header 
          title="Help & Support" 
          description="Get help using the Task Monitoring System." 
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="mt-6">
          <HelpContent />
        </div>
      </main>

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}