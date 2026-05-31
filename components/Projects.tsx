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
  Avatar,
  Badge,
  Rate,
  Progress,
  App,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  GithubOutlined,
  LinkOutlined,
  FolderOpenOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "@/services/projectsApi";
import ReusableTable from "./ui/ReusableTable";

const { Title, Text, Paragraph } = Typography;
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

const typeColorMap: Record<string, string> = {
  AI: "#722ed1",
  SAAS: "#1890ff",
  WEB: "#52c41a",
  CRM: "#fa8c16",
  APP: "#eb2f96",
  Hotel: "#13c2c2",
  Other: "#8c8c8c",
};

interface Props {
  simplified?: boolean;
}

const ProjectListPage: React.FC<Props> = ({ simplified }) => {
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
      render: (cost) => (cost ? <Text>$</Text> : <Text>—</Text>),
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

  // Card view renderer
  const renderProjectCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedProjects.length === 0 ? (
        <div className="col-span-full">
          <Empty
            description="No projects found."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        paginatedProjects.map((project, index) => {
          const coverImage =
            project.image && project.image.length > 0
              ? project.image[0]
              : "/placeholder.png";

          const typeColor = typeColorMap[project.type] || "#8c8c8c";

          return (
            <div
              key={project._id}
              className="group hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                {/* Image Container */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Type Badge - Top Left */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      count={project.type}
                      style={{
                        backgroundColor: typeColor,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "0 8px",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>

                  {/* Cost Badge - Top Right */}
                  {project.cost && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                        <DollarOutlined />${project.cost.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Bottom Center of Image */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <Tooltip title="View Project">
                      <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<EyeOutlined />}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!project.link}
                        className="shadow-lg hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: "#fff",
                          border: "none",
                          color: "#1890ff",
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<EditOutlined />}
                        onClick={() =>
                          (window.location.href = `/projects/edit/${project._id}`)
                        }
                        className="shadow-lg hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: "#1890ff",
                          border: "none",
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Are you sure to delete this project?"
                      onConfirm={() => handleDelete(project._id)}
                      okText="Yes"
                      cancelText="No"
                      disabled={isDeleting}
                    >
                      <Tooltip title="Delete">
                        <Button
                          danger
                          shape="circle"
                          size="large"
                          icon={<DeleteOutlined />}
                          loading={isDeleting}
                          className="shadow-lg hover:scale-110 transition-transform"
                          style={{ backgroundColor: "#fff", border: "none" }}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Title */}
                  <Title
                    level={4}
                    className="mb-2 font-bold leading-tight"
                    style={{ fontSize: "1rem", margin: 0 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {project.title}
                  </Title>

                  {/* Description */}
                  <Paragraph
                    className="text-gray-500 dark:text-gray-400 mb-3 flex-1"
                    style={{ fontSize: "0.85rem", margin: 0 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {project.description}
                  </Paragraph>

                  {/* Meta Info Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    {project.clientName && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <UserOutlined className="text-gray-400" />
                        <span className="truncate max-w-[100px]">
                          {project.clientName}
                        </span>
                      </div>
                    )}
                    {project.timeDuration && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <ClockCircleOutlined className="text-gray-400" />
                        <span>{project.timeDuration}</span>
                      </div>
                    )}
                  </div>

                  {/* GitHub Link */}
                  {project.github && (
                    <div className="mt-2">
                      <Button
                        type="link"
                        size="small"
                        icon={<GithubOutlined />}
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs p-0 h-auto text-gray-500 hover:text-[#D4AF37]"
                      >
                        View Source
                      </Button>
                    </div>
                  )}
                </div>

                {/* Features Tags */}
                {project.features && project.features.length > 0 && (
                  <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                    {project.features.slice(0, 3).map((feature, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {project.features.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        +{project.features.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-10"
      style={{
        backgroundImage: 'url("/backgrounds/forest-6706559.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none" />

      <div className="relative z-10">
        <Card
          variant="borderless"
          className="w-full max-w-7xl mx-auto shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20"
        >
          {!simplified && (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <Title
                    level={2}
                    className="font-bold m-0"
                    style={{ fontSize: "1.5rem" }}
                  >
                    <ProjectOutlined className="mr-2 text-[#D4AF37]" />
                    Projects Management
                  </Title>
                  <Text type="secondary" className="text-sm">
                    Manage and organize your project portfolio
                  </Text>
                </div>
                <Space wrap>
                  <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: 160 }}
                    placeholder="Filter by type"
                    className="rounded-lg"
                  >
                    {projectTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <Button
                      type={viewMode === "grid" ? "primary" : "default"}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      }
                      onClick={() => setViewMode("grid")}
                      className="rounded-none border-none"
                      style={{
                        backgroundColor:
                          viewMode === "grid" ? "#D4AF37" : undefined,
                        borderColor:
                          viewMode === "grid" ? "#D4AF37" : undefined,
                        color: viewMode === "grid" ? "#000" : undefined,
                      }}
                    />
                    <Button
                      type={viewMode === "table" ? "primary" : "default"}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      }
                      onClick={() => setViewMode("table")}
                      className="rounded-none border-none"
                      style={{
                        backgroundColor:
                          viewMode === "table" ? "#D4AF37" : undefined,
                        borderColor:
                          viewMode === "table" ? "#D4AF37" : undefined,
                        color: viewMode === "table" ? "#000" : undefined,
                      }}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => (window.location.href = "/projects/add")}
                    className="shadow-md hover:shadow-lg transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                      borderColor: "#D4AF37",
                      color: "#000",
                      fontWeight: 600,
                    }}
                  >
                    Add New Project
                  </Button>
                </Space>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wider">
                    Total Projects
                  </Text>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {projects.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <Text className="text-purple-600 dark:text-purple-400 text-xs font-medium uppercase tracking-wider">
                    Types
                  </Text>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                    {new Set(projects.map((p) => p.type)).size}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <Text className="text-green-600 dark:text-green-400 text-xs font-medium uppercase tracking-wider">
                    Filtered
                  </Text>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                    {sortedAndFilteredProjects.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <Text className="text-amber-600 dark:text-amber-400 text-xs font-medium uppercase tracking-wider">
                    Views
                  </Text>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1 capitalize">
                    {viewMode}
                  </div>
                </div>
              </div>
            </>
          )}

          <Spin
            spinning={isLoading || isDeleting}
            size="large"
            tip="Loading projects..."
          >
            {viewMode === "grid" && !simplified ? (
              renderProjectCards()
            ) : (
              <ReusableTable
                columns={columns}
                dataSource={
                  simplified ? sortedAndFilteredProjects : paginatedProjects
                }
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
                        showSizeChanger: false,
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
            )}
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default ProjectListPage;
