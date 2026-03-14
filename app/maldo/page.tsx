"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const dummyLeads = [
  {
    id: 1,
    name: "Amit Singh",
    email: "amit@example.com",
    intent: "Product Inquiry",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya@example.com",
    intent: "Demo Request",
  },
  {
    id: 3,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    intent: "Support Ticket",
  },
  {
    id: 4,
    name: "Anjali Desai",
    email: "anjali@example.com",
    intent: "Collaboration",
  },
  {
    id: 5,
    name: "Sameer Khan",
    email: "sameer@example.com",
    intent: "Feedback",
  },
];

const dummyConversations = [
  {
    id: 1,
    user: "Rohit Kumar",
    time: "2025-08-18 14:22",
    message: "Tell me more about your pricing.",
    response: "Sure! Our pricing starts at ₹499/month for basic support.",
  },
  {
    id: 2,
    user: "Deepika Rao",
    time: "2025-08-18 15:45",
    message: "Can your AI handle customer support 24/7?",
    response:
      "Yes, Maldo AI is designed to be available around the clock to assist your customers.",
  },
  {
    id: 3,
    user: "Vikas Gupta",
    time: "2025-08-19 09:10",
    message: "What languages does your chatbot support?",
    response:
      "Maldo can communicate in over 20 languages, including Hindi and Spanish.",
  },
];

const intentColors: {
  [key: string]: "default" | "secondary" | "outline" | "destructive";
} = {
  "Product Inquiry": "default",
  "Demo Request": "secondary",
  "Support Ticket": "destructive",
  Collaboration: "outline",
  Feedback: "default",
};

export default function MaldoDashboardPage() {
  const [searchLead, setSearchLead] = useState("");

  const filteredLeads = dummyLeads.filter((lead) =>
    lead.name.toLowerCase().includes(searchLead.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gray-100 dark:bg-gray-950">
      <Card className="max-w-6xl mx-auto shadow-xl border-none dark:bg-gray-900">
        <CardHeader className="border-b dark:border-gray-800">
          <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
            🤖 Maldo AI Dashboard
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your AI chatbot, review leads, and analyze conversations.
          </p>
        </CardHeader>

        <CardContent className="mt-4 p-6">
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="leads"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                Leads
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                Conversations
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                Bot Settings
              </TabsTrigger>
            </TabsList>

            {/* Leads Tab */}
            <TabsContent value="leads">
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Input
                  placeholder="Search leads..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="w-full sm:max-w-sm"
                />
                <Button variant="outline" className="w-full sm:w-auto">
                  Export to CSV
                </Button>
              </div>
              <div className="rounded-lg border dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Intent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                            {lead.name}
                          </TableCell>
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {lead.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant={intentColors[lead.intent]}>
                              {lead.intent}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-24 text-center text-gray-500 dark:text-gray-400"
                        >
                          No leads found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations">
              <div className="space-y-6">
                {dummyConversations.map((conv) => (
                  <Card
                    key={conv.id}
                    className="bg-gray-50 dark:bg-gray-800 border-none shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-gray-700 dark:text-gray-200">
                        {conv.user}
                        <span className="text-xs text-gray-400 ml-2">
                          {conv.time}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="p-3 bg-blue-100 rounded-lg max-w-lg text-gray-800 dark:bg-blue-900 dark:text-gray-100">
                        <strong className="block text-sm font-semibold mb-1">
                          User:
                        </strong>{" "}
                        {conv.message}
                      </p>
                      <p className="p-3 bg-gray-200 rounded-lg max-w-lg text-gray-800 ml-auto dark:bg-gray-700 dark:text-gray-100">
                        <strong className="block text-sm font-semibold mb-1">
                          Maldo:
                        </strong>{" "}
                        {conv.response}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label
                    htmlFor="response-style"
                    className="font-semibold block mb-2"
                  >
                    Response Style
                  </Label>
                  <Select>
                    <SelectTrigger id="response-style">
                      <SelectValue placeholder="Friendly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="active-hours"
                    className="font-semibold block mb-2"
                  >
                    Active Hours
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="start-time" type="time" defaultValue="09:00" />
                    <Input id="end-time" type="time" defaultValue="21:00" />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="welcome-message"
                    className="font-semibold block mb-2"
                  >
                    Welcome Message
                  </Label>
                  <Textarea
                    id="welcome-message"
                    defaultValue="Hi there! I'm Maldo, how can I help you today?"
                  />
                </div>
                <Button className="mt-4 w-full sm:w-auto">Save Settings</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
