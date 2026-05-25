'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MoreHorizontal, User, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TeamContent() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetch("http://localhost:40241/users")
      .then((res) => res.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching team:", err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[250px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* FIX APPLIED HERE: 
          We filter the list to only include members whose role is NOT 'admin' 
      */}
      {members
        .filter((member: any) => member.role !== 'admin') 
        .map((member: any) => (
        <div key={member.email} className="bg-card border rounded-xl p-6 shadow-sm relative hover:shadow-md transition-all group">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          <div className="flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-background shadow-sm">
              {member.full_name ? getInitials(member.full_name) : <User />}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-none">{member.full_name}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {member.role === 'admin' ? 'System Administrator' : 'Branch Staff'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] py-0 h-5">
                Active
              </Badge>
              
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span className="text-[10px] font-bold">
                  {member.task_count || 0} Tasks
                </span>
              </div>
            </div>

            <div className="w-full pt-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-[11px] gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Mail className="w-3.5 h-3.5" /> Email
              </Button>
              <Button variant="outline" className="flex-1 h-9 text-[11px] gap-2">
                <Phone className="w-3.5 h-3.5" /> Call
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Logic check: If after filtering out the admin, there are no users left,
          show the empty state message.
      */}
      {members.filter((m: any) => m.role !== 'admin').length === 0 && (
        <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl bg-secondary/5">
          <p className="text-muted-foreground italic">No team members found in database.</p>
        </div>
      )}
    </div>
  );
}