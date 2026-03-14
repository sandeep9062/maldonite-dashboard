"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReusableTable from "../../components/ui/ReusableTable";
import {
  useGetLeadsQuery,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
} from "../../services/leadApi";
import AddLeadModal from "../../components/AddLeadModal";
import EditLeadModal from "../../components/EditLeadModal";
import { Pencil, Trash2 } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Shadcn UI components for better styling
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Lead {
  _id: string;
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  status: string;
}

const statusColors: { [key: string]: string } = {
  new: "bg-blue-500",
  contacted: "bg-orange-500",
  interested: "bg-lime-500",
  proposal_sent: "bg-purple-500",
  negotiation: "bg-indigo-500",
  converted: "bg-green-600",
  lost: "bg-red-600",
};

export default function LeadsManagementPage() {
  const { data: leads, error, isLoading } = useGetLeadsQuery();
  const [deleteLead] = useDeleteLeadMutation();
  const [updateStatus] = useUpdateLeadStatusMutation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead(id);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id, status });
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const filteredLeads = leads?.filter((lead: Lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "all" || lead.status === statusFilter)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-600">
        Error loading leads.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 sm:p-10 flex items-center justify-center"
      style={{
        backgroundImage: "url('/backgrounds/lead-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card className="w-full max-w-6xl rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 border-none">
        <CardHeader className="border-b-2 border-gray-100 p-6">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Leads Management 🚀
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:max-w-xs">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="converted">Converted/Success</SelectItem>
                <SelectItem value="lost">Lost/Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add New Lead
            </Button>
          </div>
          
          <AddLeadModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
          <EditLeadModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            lead={editingLead}
          />
          
          <ReusableTable
            dataSource={filteredLeads || []}
            columns={[
              {
                title: "#",
                dataIndex: "id",
                render: (_text: string, _record: Lead, index: number) => index + 1,
              },
              { title: "Name", dataIndex: "name" },
              { title: "Phone", dataIndex: "phone" },
              { title: "Email", dataIndex: "email" },
              { title: "Project", dataIndex: "projectType" },
              {
                title: "Status",
                dataIndex: "status",
                render: (status: string, record: Lead) => (
                  <Select
                    value={status}
                    onValueChange={(value) => handleStatusChange(record._id, value)}
                  >
                    <SelectTrigger className={`w-[140px] border-none ${statusColors[status] || 'bg-gray-200'} text-white font-semibold`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="converted">Converted/Success</SelectItem>
                      <SelectItem value="lost">Lost/Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
              {
                title: "Actions",
                dataIndex: "actions",
                render: (_text: string, record: Lead) => (
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Lead</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Lead</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}