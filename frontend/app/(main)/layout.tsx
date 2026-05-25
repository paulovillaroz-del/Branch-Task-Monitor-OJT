"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header" // 1. I-import ang Header
import { Toaster } from "react-hot-toast"
import NotificationHandler from "@/components/NotificationHandler"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Siguraduhing tama ang email source mo */}
      <NotificationHandler userEmail={typeof window !== 'undefined' ? localStorage.getItem("email") || "" : ""} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:ml-64">
        
        {/* DITO ANG FIX: Palitan ang manual header ng iyong Header component */}
        <Header 
        
          onMenuClick={() => setIsSidebarOpen(true)} 
        />


        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}