'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AnalyticsContent } from "@/components/analytics/analytics-content";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function AnalyticsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    total: 0,
  });

  // 1. Fetch live analytics from the new Go route
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:8080/analytics/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
      }
    };

    fetchAnalytics();
    // Refresh every 30 seconds to keep data live
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar Handshake */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-4 lg:p-6 transition-all duration-300">
        <Header
          title="Analytics"
          description="Track your performance and productivity metrics."
          onMenuClick={() => setIsSidebarOpen(true)}
          actions={
            <Button
              variant="outline"
              className="w-full sm:w-auto h-9 text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-emerald-600 text-white border-none hover:bg-emerald-700"
              onClick={() => window.print()} // Quick print functionality
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          }
        />

        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 2. Pass the live stats into your content component */}
          <AnalyticsContent stats={stats} />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
}