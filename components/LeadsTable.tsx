"use client";
import React from "react";

type Lead = {
  id: string;
  name?: string;
  email?: string;
  contact?: string;
  interest?: string;
  source?: string;
  date?: string;
  status?: string;
};

export default function LeadsTable({ leads = [] as Lead[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="p-2">Name</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Interest</th>
            <th className="p-2">Source</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                No recent leads
              </td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id} className="text-sm">
                <td className="p-2">{l.name ?? "—"}</td>
                <td className="p-2">{l.email ?? l.contact ?? "—"}</td>
                <td className="p-2">{l.interest ?? "—"}</td>
                <td className="p-2">{l.source ?? "Chatbot"}</td>
                <td className="p-2">{l.date ? new Date(l.date).toLocaleString() : "—"}</td>
                <td className="p-2">{l.status ?? "New"}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 text-xs bg-green-600 text-white rounded">Assign</button>
                    <button className="px-2 py-1 text-xs bg-gray-200 rounded">View</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
