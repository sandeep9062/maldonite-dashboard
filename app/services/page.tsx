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
  Upload,
  Switch,
  Tag,
  Select,
  Tooltip,
  Typography,
  Spin,
} from "antd";
import type { UploadFile } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "@/services/servicesApi";

interface Service {
  _id?: string; // Ensure this is available
  slug: string;
  title: string;
  desc: string;
  longDesc: string;
  tags: string[];
  icon?: string;
  category?: string;
  featured?: boolean;
  duration?: string;
  pricing?: string;
  cta?: string;
  tools: string[];
  points: string[];
  valueProvide: string[];
  targetAudience?: string;
  keywords: string[];
  image?: string;
  serviceImage?: string;
  createdAt?: string;
}

const { Meta } = Card;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const ServicesPage = () => {
  const { data, isLoading: isFetchingServices } = useGetServicesQuery();
  const [addService, { isLoading: isAddingService }] = useAddServiceMutation();
  const [updateService, { isLoading: isUpdatingService }] =
    useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeletingService }] =
    useDeleteServiceMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<UploadFile[]>([]);
  const [serviceImageFile, setServiceImageFile] = useState<UploadFile[]>([]);

  const isSubmitting = isAddingService || isUpdatingService;

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingService(null);
      setImageFile([]);
      setServiceImageFile([]);
    }
  }, [isModalOpen, form]);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (record: Service) => {
    setEditingService(record);
    form.setFieldsValue({
      ...record,
      tags: record.tags,
      tools: record.tools,
      points: record.points,
      valueProvide: record.valueProvide,
      keywords: record.keywords,
    });

    setImageFile(
      record.image
        ? [{ uid: "-1", name: "image.png", status: "done", url: record.image }]
        : [],
    );
    setServiceImageFile(
      record.serviceImage
        ? [
            {
              uid: "-2",
              name: "serviceImage.png",
              status: "done",
              url: record.serviceImage,
            },
          ]
        : [],
    );
    setIsModalOpen(true);
  };

  const handleDelete = async (_id: string | undefined) => {
    if (!_id) return;
    try {
      await deleteService(_id).unwrap();
      toast.success("Service deleted successfully");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          if (Array.isArray(values[key])) {
            values[key].forEach((item) => {
              formData.append(key, item);
            });
          } else if (typeof values[key] === "boolean") {
            formData.append(key, values[key].toString());
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      if (imageFile.length > 0 && imageFile[0].originFileObj) {
        formData.append("image", imageFile[0].originFileObj);
      }
      if (serviceImageFile.length > 0 && serviceImageFile[0].originFileObj) {
        formData.append("serviceImage", serviceImageFile[0].originFileObj);
      }

      if (editingService) {
        await updateService({ id: editingService._id!, formData }).unwrap();
        toast.success("Service updated successfully");
      } else {
        await addService(formData).unwrap();
        toast.success("Service added successfully");
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const renderTags = (tags: string[]) => (
    <div className="mt-2">
      {tags?.map((tag, index) => (
        <Tag key={index} color="#66bb6a">
          {tag}
        </Tag>
      ))}
    </div>
  );

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
          <Title level={2} className="mb-4! sm:mb-0! font-bold">
            Services Management
          </Title>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              background: "#66bb6a",
              borderColor: "#66bb6a",
            }}
          >
            Add Service
          </Button>
        </div>

        <Spin
          spinning={isFetchingServices || isDeletingService}
          description="Loading services..."
        >
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {data?.length === 0 && !isFetchingServices ? (
              <div className="col-span-full text-center py-20">
                <Text type="secondary" className="text-xl">
                  No services found. Add a new one to get started!
                </Text>
              </div>
            ) : (
              data?.map((service) => (
                <Card
                  key={service._id}
                  hoverable
                  className="rounded-xl overflow-hidden service-card"
                  cover={
                    <img
                      alt={service.title}
                      src={service.image || "/placeholder-image.png"}
                      style={{
                        height: 200,
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  }
                  actions={[
                    <Tooltip key="view" title="View Details">
                      <Button type="text" icon={<EyeOutlined />} />
                    </Tooltip>,
                    <Tooltip key="edit" title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(service)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="Delete this service?"
                      onConfirm={() => handleDelete(service._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title="Delete">
                        <Button type="text" icon={<DeleteOutlined />} danger />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                >
                  <Meta
                    title={
                      <Title level={4} className="mt-0! mb-1!">
                        {service.title}
                      </Title>
                    }
                    description={<Text type="secondary">{service.desc}</Text>}
                  />
                  {renderTags(service.tags)}
                </Card>
              ))
            )}
          </div>
        </Spin>
      </Card>

      <Modal
        title={
          <Title level={3} className="mt-0!">
            {editingService ? "Edit Service" : "Add Service"}
          </Title>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: isSubmitting }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ featured: false }}
          className="grid sm:grid-cols-2 gap-x-8 gap-y-4"
        >
          {/* Left Column */}
          <div>
            <Form.Item
              name="title"
              label="Service Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input
                placeholder="e.g., Website Design & Development"
                disabled={isSubmitting}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = generateSlug(title);
                  form.setFieldsValue({ slug });
                }}
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label="URL Slug"
              rules={[{ required: true, message: "Please enter a slug" }]}
            >
              <Input
                placeholder="e.g., website-design"
                disabled={!!editingService || isSubmitting}
              />
            </Form.Item>

            <Form.Item name="desc" label="Short Description">
              <TextArea
                placeholder="A brief description for the service card (max 150 characters)"
                rows={2}
                disabled={isSubmitting}
                maxLength={150}
              />
            </Form.Item>

            <Form.Item name="longDesc" label="Detailed Description">
              <TextArea
                placeholder="Full, detailed description of the service"
                rows={4}
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags (e.g., web design, marketing) and press Enter"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="icon" label="Icon Name (e.g., FaLaptopCode)">
              <Input disabled={isSubmitting} />
            </Form.Item>

            <Form.Item name="category" label="Category">
              <Input
                placeholder="e.g., Development, Design"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="featured"
              label="Featured Service"
              valuePropName="checked"
            >
              <Switch disabled={isSubmitting} />
            </Form.Item>
          </div>

          {/* Right Column */}
          <div>
            <Form.Item name="duration" label="Duration">
              <Input placeholder="e.g., 2-4 weeks" disabled={isSubmitting} />
            </Form.Item>

            <Form.Item name="pricing" label="Pricing">
              <Input placeholder="e.g., From $1500" disabled={isSubmitting} />
            </Form.Item>

            <Form.Item name="cta" label="Call to Action Text">
              <Input placeholder="e.g., Get a Quote" disabled={isSubmitting} />
            </Form.Item>

            <Form.Item name="tools" label="Tools & Technologies">
              <Select
                mode="tags"
                placeholder="e.g., React, Node.js, Figma"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="points" label="Key Service Points">
              <Select
                mode="tags"
                placeholder="Add key features or benefits"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="valueProvide" label="Value Proposition">
              <Select
                mode="tags"
                placeholder="What value will the customer get?"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="targetAudience" label="Target Audience">
              <Input
                placeholder="e.g., Small businesses, startups"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item name="keywords" label="SEO Keywords">
              <Select
                mode="tags"
                placeholder="Add SEO keywords"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              label="Main Image"
              help="Image displayed on the service card"
            >
              <Upload
                beforeUpload={() => false}
                fileList={imageFile}
                onChange={({ fileList }) => setImageFile(fileList)}
                accept="image/*"
                disabled={isSubmitting}
                maxCount={1}
                listType="picture-card"
              >
                {imageFile.length >= 1 ? null : (
                  <Button icon={<UploadOutlined />} disabled={isSubmitting}>
                    Select
                  </Button>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Detailed Service Image"
              help="Image for the full service page"
            >
              <Upload
                beforeUpload={() => false}
                fileList={serviceImageFile}
                onChange={({ fileList }) => setServiceImageFile(fileList)}
                accept="image/*"
                disabled={isSubmitting}
                maxCount={1}
                listType="picture-card"
              >
                {serviceImageFile.length >= 1 ? null : (
                  <Button icon={<UploadOutlined />} disabled={isSubmitting}>
                    Select
                  </Button>
                )}
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
