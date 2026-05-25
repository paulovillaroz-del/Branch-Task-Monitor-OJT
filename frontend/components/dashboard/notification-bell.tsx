"use client"
import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

export function NotificationBell({ email }: { email: string }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Tawagin ang API na ginawa natin sa backend
    fetch(`http://localhost:40241/notifications?email=${email}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
  }, [email])

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </div>
  )
}