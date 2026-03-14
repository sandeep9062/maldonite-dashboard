"use client";
import React from "react";

export default function NotificationsPanel({ notifications = [] as any[] }) {
  return (
    <div className="bg-card">
      <h2 className="text-lg font-medium mb-3">Notifications</h2>
      <ul className="space-y-3 text-sm">
        {notifications.length === 0 && <li className="text-gray-500">No notifications</li>}
        {notifications.slice(0, 8).map((n: any, idx: number) => (
          <li key={n.id ?? idx} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
            <div>
              <div>{n.text}</div>
              <div className="text-xs text-gray-500">{n.time ? new Date(n.time).toLocaleString() : ""}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
