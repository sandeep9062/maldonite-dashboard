"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Empty,
  Popconfirm,
  Modal,
  Descriptions,
  Input,
  Select,
  Typography,
  Tooltip,
  Breakpoint,
} from "antd";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "../../services/contactApi";
import { toast } from "sonner";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

const { Title, Text } = Typography;

export default function EnquiriesPage() {
  const { data, isLoading } = useGetContactsQuery();
  const [updateContact] = useUpdateContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const enquiries: Enquiry[] = Array.isArray(data)
    ? data
    : data?.contacts || [];

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? enquiry.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateContact({
        id,
        status,
      }).unwrap();
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteEnquiry = async (id: string) => {
    try {
      await deleteContact(id).unwrap();
      toast.success("Enquiry deleted successfully");
    } catch {
      toast.error("Failed to delete enquiry");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"] as Breakpoint[],
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis className="max-w-[150px]!">
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Enquiry["status"]) => {
        const color =
          status === "new" ? "blue" : status === "read" ? "green" : "volcano";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      responsive: ["lg"] as Breakpoint[],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Enquiry) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEnquiry(record);
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Mark as Read">
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(record._id, "read");
              }}
            />
          </Tooltip>
          <Tooltip title="Archive">
            <Button
              size="small"
              icon={<InboxOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(record._id, "archived");
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete enquiry?"
            description="This action cannot be undone."
            okText="Yes, delete"
            cancelText="Cancel"
            onConfirm={(e) => {
              e?.stopPropagation();
              deleteEnquiry(record._id);
            }}
          >
            <Tooltip title="Delete">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen p-6 sm:p-10 flex items-start justify-center"
      style={{
        backgroundImage: "url('/backgrounds/lead-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        variant="borderless"
        className="w-full max-w-6xl shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Title
            level={2}
            className="mb-4! sm:mb-0! font-bold! text-center sm:text-left"
          >
            📩 Enquiries
          </Title>
          <Space wrap size="large">
            <Input.Search
              placeholder="Search by name, email, or subject"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", maxWidth: 300 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              onChange={(value) => setStatusFilter(value)}
              style={{ width: "100%", minWidth: 180 }}
              allowClear
            >
              <Select.Option value="new">New</Select.Option>
              <Select.Option value="read">Read</Select.Option>
              <Select.Option value="archived">Archived</Select.Option>
            </Select>
          </Space>
        </div>
        <Table
          rowKey="_id"
          loading={isLoading}
          columns={columns}
          dataSource={filteredEnquiries}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{
            emptyText: (
              <Empty
                description="No enquiries yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          className="enquiries-table"
        />
      </Card>

      {/* Modal for Enquiry Details */}
      <Modal
        title={<span className="font-bold">📋 Enquiry Details</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedEnquiry && (
          <Descriptions bordered column={1} size="small" className="mt-4">
            <Descriptions.Item label="Name">
              {selectedEnquiry.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedEnquiry.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedEnquiry.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
              {selectedEnquiry.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              <div style={{ whiteSpace: "pre-wrap" }}>
                {selectedEnquiry.message}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedEnquiry.status === "new"
                    ? "blue"
                    : selectedEnquiry.status === "read"
                      ? "green"
                      : "volcano"
                }
              >
                {selectedEnquiry.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(selectedEnquiry.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
