'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast'; // Import bilang default

export default function NotificationHandler({ userEmail }: { userEmail: string }) {
  useEffect(() => {
    if (!userEmail || userEmail === "paulo...") return;

    const ws = new WebSocket("ws://localhost:40241/ws/chat?email=" + userEmail);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_NOTIFICATION") {
          // Gamitin ang simpleng toast function
          toast("📢 " + data.message);
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    return () => ws.close();
  }, [userEmail]);

  return null;
}