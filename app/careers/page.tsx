"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Select,
  Typography,
  Spin,
  Table,
  Badge,
  DatePicker,
  InputNumber,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  useGetCareersAdminQuery,
  useAddCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
} from "@/services/careerApi";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Career {
  _id?: string;
  title: string;
  type: string;
  location: string;
  department: "Business & Ops" | "Engineering";
  description: string;
  requirements: string[];
  highlights: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  experienceLevel?: string;
  isActive: boolean;
  isPublished: boolean;
  applicationDeadline?: string;
  benefits?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

const CareersPage = () => {
  const { data, isLoading: isFetchingCareers } = useGetCareersAdminQuery();
  const [addCareer, { isLoading: isAdding }] = useAddCareerMutation();
  const [updateCareer, { isLoading: isUpdating }] = useUpdateCareerMutation();
  const [deleteCareer, { isLoading: isDeleting }] = useDeleteCareerMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [form] = Form.useForm();

  const isSubmitting = isAdding || isUpdating;
  const careers: Career[] = data?.careers || [];

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingCareer(null);
    }
  }, [isModalOpen, form]);

  const handleAdd = () => {
    setEditingCareer(null);
    form.resetFields();
    form.setFieldsValue({
      department: "Engineering",
      isActive: true,
      isPublished: true,
      order: 0,
      salary: { currency: "INR", period: "Negotiable" },
      experienceLevel: "Junior",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Career) => {
    setEditingCareer(record);
    form.setFieldsValue({
      title: record.title,
      type: record.type,
      location: record.location,
      department: record.department,
      description: record.description,
      requirements: record.requirements,
      highlights: record.highlights,
      experienceLevel: record.experienceLevel,
      isActive: record.isActive,
      isPublished: record.isPublished,
      order: record.order,
      benefits: record.benefits,
      applicationDeadline: record.applicationDeadline
        ? new Date(record.applicationDeadline)
        : undefined,
      salary: record.salary,
      seo: record.seo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (_id: string | undefined) => {
    if (!_id) return;
    try {
      await deleteCareer(_id).unwrap();
      toast.success("Job listing deleted successfully");
    } catch {
      toast.error("Failed to delete job listing");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Process requirements & highlights from comma-separated strings to arrays
      const payload = {
        ...values,
        requirements: Array.isArray(values.requirements)
          ? values.requirements
          : values.requirements
            ? values.requirements
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        highlights: Array.isArray(values.highlights)
          ? values.highlights
          : values.highlights
            ? values.highlights
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        benefits: Array.isArray(values.benefits)
          ? values.benefits
          : values.benefits
            ? values.benefits
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
      };

      if (editingCareer) {
        await updateCareer({ id: editingCareer._id!, data: payload }).unwrap();
        toast.success("Job listing updated successfully");
      } else {
        await addCareer(payload).unwrap();
        toast.success("Job listing created successfully");
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error("Operation failed. Please check all required fields.");
    }
  };

  const columns: ColumnsType<Career> = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 70,
      sorter: (a, b) => (a.order || 0) - (b.order || 0),
      render: (order: number) => order || 0,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.type} · {record.location}
          </Text>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
      filters: [
        { text: "Engineering", value: "Engineering" },
        { text: "Business & Ops", value: "Business & Ops" },
      ],
      onFilter: (value, record) => record.department === value,
      render: (dept: string) => (
        <Tag
          color={dept === "Engineering" ? "green" : "blue"}
          className="rounded-lg px-3 py-0.5"
        >
          {dept}
        </Tag>
      ),
    },
    {
      title: "Exp. Level",
      dataIndex: "experienceLevel",
      key: "experienceLevel",
      width: 110,
      render: (level: string) => (
        <Tag className="rounded-lg px-2 py-0.5">{level || "—"}</Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Badge
            status={record.isActive ? "success" : "default"}
            text={
              <Text type={record.isActive ? undefined : "secondary"}>
                {record.isActive ? "Active" : "Inactive"}
              </Text>
            }
          />
          <Badge
            status={record.isPublished ? "processing" : "warning"}
            text={
              <Text type={record.isPublished ? undefined : "secondary"}>
                {record.isPublished ? "Published" : "Draft"}
              </Text>
            }
          />
        </Space>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
      render: (date: string) =>
        date
          ? new Date(date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this job listing?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen p-6 sm:p-10"
      style={{
        backgroundImage: "url('/backgrounds/lead-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        variant="borderless"
        className="w-full shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md"
        style={{ maxWidth: 1400, margin: "0 auto" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <Title level={2} className="mb-1! font-bold">
              <RocketOutlined className="mr-2 text-purple-500" />
              Careers Management
            </Title>
            <Text type="secondary">
              Manage job listings displayed on the career page
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              background: "#7c3aed",
              borderColor: "#7c3aed",
            }}
          >
            Add Job Listing
          </Button>
        </div>

        <Spin
          spinning={isFetchingCareers || isDeleting}
          tip={isDeleting ? "Deleting..." : "Loading careers..."}
        >
          <Table
            columns={columns}
            dataSource={careers}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} job listings`,
            }}
            locale={{
              emptyText: (
                <div className="py-16">
                  <RocketOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text type="secondary" className="text-lg block">
                    No job listings yet. Add your first opening to get started!
                  </Text>
                </div>
              ),
            }}
          />
        </Spin>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <Title level={3} className="mt-0!">
            {editingCareer ? "Edit Job Listing" : "Add New Job Listing"}
          </Title>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: isSubmitting }}
        okText={editingCareer ? "Update Listing" : "Create Listing"}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            department: "Engineering",
            isActive: true,
            isPublished: true,
            order: 0,
            experienceLevel: "Junior",
          }}
          className="grid sm:grid-cols-2 gap-x-8 gap-y-2"
        >
          {/* Left Column — Core Info */}
          <div>
            <Form.Item
              name="title"
              label="Job Title"
              rules={[{ required: true, message: "Please enter a job title" }]}
            >
              <Input
                placeholder="e.g., Full-Stack Software Engineer"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="Employment Type"
              rules={[
                { required: true, message: "Please enter employment type" },
              ]}
            >
              <Input
                placeholder="e.g., Full-Time / Internship / Contract"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter a location" }]}
            >
              <Input
                placeholder="e.g., Panchkula / Hybrid / Remote"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
              rules={[
                { required: true, message: "Please select a department" },
              ]}
            >
              <Select disabled={isSubmitting}>
                <Option value="Engineering">Engineering</Option>
                <Option value="Business & Ops">Business & Ops</Option>
              </Select>
            </Form.Item>

            <Form.Item name="experienceLevel" label="Experience Level">
              <Select disabled={isSubmitting}>
                <Option value="Fresher">Fresher</Option>
                <Option value="Junior">Junior</Option>
                <Option value="Mid">Mid</Option>
                <Option value="Senior">Senior</Option>
                <Option value="Lead">Lead</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Job Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <TextArea
                placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                rows={4}
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="requirements"
              label="Requirements"
              help="Comma-separated list of requirements"
            >
              <TextArea
                placeholder="e.g., Deep expertise in Next.js, Production-level MongoDB, Proficiency in Python"
                rows={3}
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="highlights"
              label="Highlights / Perks"
              help="Comma-separated list of role highlights"
            >
              <TextArea
                placeholder="e.g., Work on AI/ML projects, Full architecture ownership, Direct revenue impact"
                rows={2}
                disabled={isSubmitting}
              />
            </Form.Item>
          </div>

          {/* Right Column — Settings & SEO */}
          <div>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch
                disabled={isSubmitting}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>

            <Form.Item
              name="isPublished"
              label="Published"
              valuePropName="checked"
            >
              <Switch
                disabled={isSubmitting}
                checkedChildren="Published"
                unCheckedChildren="Draft"
              />
            </Form.Item>

            <Form.Item name="order" label="Display Order">
              <InputNumber
                min={0}
                className="w-full"
                disabled={isSubmitting}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item name="applicationDeadline" label="Application Deadline">
              <DatePicker
                className="w-full"
                disabled={isSubmitting}
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <div className="border-t border-gray-200 pt-4 mt-2">
              <Text type="secondary" strong className="block mb-3">
                Salary Range (Optional)
              </Text>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name={["salary", "min"]} label="Min Salary">
                  <InputNumber
                    min={0}
                    className="w-full"
                    disabled={isSubmitting}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
                <Form.Item name={["salary", "max"]} label="Max Salary">
                  <InputNumber
                    min={0}
                    className="w-full"
                    disabled={isSubmitting}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name={["salary", "currency"]}
                  label="Currency"
                  initialValue="INR"
                >
                  <Select disabled={isSubmitting}>
                    <Option value="INR">INR (₹)</Option>
                    <Option value="USD">USD ($)</Option>
                    <Option value="EUR">EUR (€)</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={["salary", "period"]}
                  label="Period"
                  initialValue="Negotiable"
                >
                  <Select disabled={isSubmitting}>
                    <Option value="Monthly">Monthly</Option>
                    <Option value="Yearly">Yearly</Option>
                    <Option value="Hourly">Hourly</Option>
                    <Option value="Negotiable">Negotiable</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
              <Text type="secondary" strong className="block mb-3">
                SEO (Optional)
              </Text>
              <Form.Item name={["seo", "metaTitle"]} label="Meta Title">
                <Input
                  placeholder="SEO title for the job listing page"
                  disabled={isSubmitting}
                />
              </Form.Item>
              <Form.Item
                name={["seo", "metaDescription"]}
                label="Meta Description"
              >
                <TextArea
                  placeholder="SEO description for search engines"
                  rows={2}
                  disabled={isSubmitting}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CareersPage;
