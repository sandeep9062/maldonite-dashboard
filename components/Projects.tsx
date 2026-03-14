"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Card,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "@/services/projectsApi";
import ReusableTable from "./ui/ReusableTable";

const { Title, Text } = Typography;
const { Option } = Select;

interface Project {
  _id: string;
  title: string;
  image: string[];
  description: string;
  features: string[];
  type: string;
  github?: string;
  clientName?: string;
  createdAt?: string;
  timeDuration?: string;
  cost?: number;
  link?: string;
}

const projectTypes = [
  "All",
  "AI",
  "SAAS",
  "WEB",
  "CRM",
  "APP",
  "Hotel",
  "Other",
];

interface Props {
  simplified?: boolean;
}

const ProjectListPage: React.FC<Props> = ({ simplified }) => {
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (images: string[]) => (
        <img
          src={images?.[0] || "/placeholder.png"}
          alt="project"
          style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      responsive: ["lg"],
      render: (client) => <Text>{client || "—"}</Text>,
    },
    {
      title: "Duration",
      dataIndex: "timeDuration",
      key: "timeDuration",
      responsive: ["md"],
      render: (duration) => <Text>{duration ? `${duration}` : "—"}</Text>,
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      responsive: ["lg"],
      render: (cost) =>
        cost ? <Text>${cost.toLocaleString()}</Text> : <Text>—</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Project">
            <Button
              type="text"
              icon={<EyeOutlined />}
              href={record.link}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!record.link}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() =>
                (window.location.href = `/projects/edit/${record._id}`)
              }
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this project?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={isDeleting}
          >
            <Tooltip title="Delete">
              <Button danger icon={<DeleteOutlined />} loading={isDeleting} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sortedAndFilteredProjects: Project[] = (() => {
    let result = [...projects];
    result.sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime(),
    );

    if (simplified) {
      return result.slice(0, 10);
    }

    if (filterType !== "All") {
      result = result.filter((p) => p.type === filterType);
    }

    return result;
  })();

  const paginatedProjects = simplified
    ? sortedAndFilteredProjects
    : sortedAndFilteredProjects.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div
      className="min-h-screen p-6 sm:p-10"
      style={{
        backgroundImage: 'url("/backgrounds/forest-6706559.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        variant="borderless"
        className="w-full max-w-7xl mx-auto shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md"
      >
        {!simplified && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <Title level={2} className="mb-4! sm:mb-0! font-bold">
              Projects Management
            </Title>
            <Space>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 200 }}
                placeholder="Filter by type"
              >
                {projectTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => (window.location.href = "/projects/add")}
                style={{ background: "#1890ff", borderColor: "#1890ff" }}
              >
                Add New Project
              </Button>
            </Space>
          </div>
        )}

        <Spin
          spinning={isLoading || isDeleting}
          description="Loading projects..."
        >
          <ReusableTable
            columns={columns}
            dataSource={paginatedProjects}
            rowKey="_id"
            bordered
            pagination={
              simplified
                ? false
                : {
                    current: currentPage,
                    pageSize: 20,
                    total: sortedAndFilteredProjects.length,
                    onChange: setCurrentPage,
                  }
            }
            locale={{
              emptyText: (
                <Empty
                  description="No projects found."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ProjectListPage;
