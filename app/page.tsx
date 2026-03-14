"use client";

import { Typography, Card, Button } from "antd";
import {
  FaMoneyBillWave,
  FaArrowDown,
  FaArrowUp,
  FaUsers,
  FaFile,
  FaBriefcase,
  FaEnvelopeOpenText,
  FaBullseye,
  FaRobot,
} from "react-icons/fa";
import millify from "millify";

import { useGetBlogsQuery } from "@/services/blogsApi";
import { useGetClientsQuery } from "@/services/clientApi";
import { useGetContactsQuery } from "@/services/contactApi";
import { useGetLeadsQuery } from "@/services/leadApi";

import { useGetProjectsQuery } from "@/services/projectsApi";

//import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectListPage from "@/components/Projects";
import Charts from "@/components/Charts";
import NotificationsPanel from "@/components/NotificationsPanel";
import QuickActions from "@/components/QuickActions";

const { Title } = Typography;

interface Project {
  type: string;
  cost?: number;
}

export default function Home() {
  const { data: blogsData, isFetching: isFetchingBlogs } = useGetBlogsQuery();
  const { data: clientsData, isFetching: isFetchingClients } =
    useGetClientsQuery();
  const { data: contactsData, isFetching: isFetchingContacts } =
    useGetContactsQuery();
  const { data: leadsData, isFetching: isFetchingLeads } = useGetLeadsQuery();
  const { data: projectsData, isFetching: isFetchingProjects } =
    useGetProjectsQuery();
  

  const isLoading =
    isFetchingBlogs ||
    isFetchingClients ||
    isFetchingContacts ||
    isFetchingLeads ||
    isFetchingProjects ;

  //const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Ensure data is always an array
  const projects: Project[] = projectsData || [];

  const blogs = blogsData || [];
  const clients = clientsData.data || [];
  const contacts = contactsData?.contacts || [];
  const leads = leadsData || [];
   console.log(clients,"clientsss")



// ✅ Calculate revenue, expenses, and profit from project costs
const totalRevenue = projects.reduce((acc, curr) => acc + (curr.cost || 0), 0);
const totalExpenses = totalRevenue * 0.4;
const totalProfit = totalRevenue * 0.6;









  // ✅ Compute stats from projects
  const MaldoniteStats = [
    {
      label: "Revenue",
      value: millify(totalRevenue),
      icon: <FaMoneyBillWave size={32} />,
      gradient: "from-green-400 to-blue-500",
    },
    {
      label: "Expenses",
      value: millify(totalExpenses),
      icon: <FaArrowDown size={32} />,
      gradient: "from-red-400 to-yellow-500",
    },
    {
      label: "Profit",
      value: millify(totalProfit),
      icon: <FaArrowUp size={32} />,
      gradient: "from-teal-400 to-cyan-500",
    },
    {
      label: "Total Clients",
      value: millify(clients.length),
      icon: <FaUsers size={32} />,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "Total Enquiries",
      value: millify(contacts.length),
      icon: <FaEnvelopeOpenText size={32} />,
      gradient: "from-orange-400 to-red-500",
    },
    {
      label: "Total Projects",
      value: millify(projects.length),
      icon: <FaBriefcase size={32} />,
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      label: "Total Blogs",
      value: millify(blogs.length),
      icon: <FaFile size={32} />,
      gradient: "from-yellow-400 to-amber-500",
    },
    {
      label: "Leads Generated",
      value: millify(leads.length),
      icon: <FaBullseye size={32} />,
      gradient: "from-indigo-400 to-purple-500",
    },
    {
      label: "Maldo AI Leads",
      value: projects.filter((p) => p.type ==="AI").length,
      icon: <FaRobot size={32} />,
      gradient: "from-pink-400 to-rose-500",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-(--breakpoint-xl) mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <Title level={2} className="text-gray-800 font-bold">
              Welcome to Admin Panel
            </Title>
            <p className="text-gray-500">
              Here's a snapshot of your business performance.
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {MaldoniteStats.slice(0, 4).map(
            ({ label, value, icon, gradient }) => (
              <Card
                key={label}
                className={`relative overflow-hidden rounded-lg shadow-lg border-0 text-white bg-linear-to-r ${gradient} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                  </div>
                  <div className="text-4xl opacity-50">{icon}</div>
                </div>
              </Card>
            )
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Charts */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <Charts />
          </div>

          {/* Right Column: Notifications and other stats */}
          <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <NotificationsPanel />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MaldoniteStats.slice(4).map(
                ({ label, value, icon, gradient }) => (
                  <Card
                    key={label}
                    className={`relative overflow-hidden rounded-lg shadow-md border-0 text-white bg-linear-to-r ${gradient} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-2xl font-bold">{value}</p>
                        </div>
                        <div className="text-3xl opacity-50">{icon}</div>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>

        {/* Ongoing Projects */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="text-gray-700">
              Ongoing Projects
            </Title>
            <Link href="/projects">
              <Button type="default" shape="round">
                Show More
              </Button>
            </Link>
          </div>
          <ProjectListPage simplified />
        </div>
      </div>
    </div>
  );
}
