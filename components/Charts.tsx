"use client";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Select, Typography } from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

const { Title } = Typography;
const { Option } = Select;

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Charts() {
  const [timeRange, setTimeRange] = useState<"6-month" | "1-year" | "quarterly">("6-month");

  // Mock data - in a real app, this would fetch based on timeRange
  const dataSets: {
    [key: string]: {
      labels: string[];
      revenue: number[];
      profit: number[];
      expenses: number[];
      projects: number[];
      leads: number[];
      conversions: number[];
    };
  } = {
    "6-month": {
      labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      revenue: [18000, 22000, 35000, 30000, 45000, 60000],
      profit: [8000, 12000, 20000, 18000, 28000, 40000],
      expenses: [10000, 10000, 15000, 12000, 17000, 20000],
      projects: [5, 8, 12, 10, 15, 18],
      leads: [50, 65, 80, 75, 90, 110],
      conversions: [10, 15, 25, 20, 30, 45],
    },
    "1-year": {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      revenue: [25000, 28000, 32000, 30000, 45000, 60000, 55000, 70000, 75000, 80000, 85000, 90000],
      profit: [12000, 15000, 18000, 16000, 28000, 40000, 35000, 45000, 50000, 55000, 60000, 65000],
      expenses: [13000, 13000, 14000, 14000, 17000, 20000, 20000, 25000, 25000, 25000, 25000, 25000],
      projects: [8, 10, 12, 11, 15, 18, 16, 20, 22, 25, 28, 30],
      leads: [60, 70, 80, 75, 90, 110, 100, 120, 130, 140, 150, 160],
      conversions: [15, 20, 25, 22, 30, 45, 40, 50, 55, 60, 65, 70],
    },
    quarterly: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      revenue: [85000, 135000, 210000, 260000],
      profit: [45000, 74000, 120000, 150000],
      expenses: [40000, 61000, 90000, 110000],
      projects: [30, 43, 58, 83],
      leads: [210, 275, 390, 450],
      conversions: [60, 87, 135, 190],
    },
  };

  const activeData = dataSets[timeRange];

  const financialData = {
    labels: activeData.labels,
    datasets: [
      {
        label: "Revenue",
        data: activeData.revenue,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
      {
        label: "Profit",
        data: activeData.profit,
        borderColor: "rgb(54, 162, 235)",
        tension: 0.3,
      },
      {
        label: "Expenses",
        data: activeData.expenses,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.3,
      },
    ],
  };

  const projectsData = {
    labels: activeData.labels,
    datasets: [
      {
        label: "Projects Completed",
        data: activeData.projects,
        borderColor: "rgb(255, 159, 64)",
        tension: 0.3,
      },
    ],
  };

  const leadsData = {
    labels: activeData.labels,
    datasets: [
      {
        label: "Leads Generated",
        data: activeData.leads,
        borderColor: "rgb(153, 102, 255)",
        tension: 0.3,
      },
      {
        label: "Conversions",
        data: activeData.conversions,
        borderColor: "rgb(255, 205, 86)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <Title level={4} className="text-gray-700">
          Performance Trends
        </Title>
        <Select
          defaultValue="6-month"
          onChange={(value: "6-month" | "1-year" | "quarterly") => setTimeRange(value)}
          className="w-32"
        >
          <Option value="6-month">Monthly</Option>
          <Option value="quarterly">Quarterly</Option>
          <Option value="1-year">Yearly</Option>
        </Select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Overview */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl">
          <h3 className="text-lg font-medium mb-4 text-gray-600">
            Financial Overview
          </h3>
          <div className="h-64">
            <Line data={financialData} />
          </div>
        </div>

        {/* Project Completion */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl">
          <h3 className="text-lg font-medium mb-4 text-gray-600">
            Project Completion
          </h3>
          <div className="h-64">
            <Line data={projectsData} />
          </div>
        </div>

        {/* Leads and Conversions */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl lg:col-span-2">
          <h3 className="text-lg font-medium mb-4 text-gray-600">
            Leads and Conversions
          </h3>
          <div className="h-64">
            <Line data={leadsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
