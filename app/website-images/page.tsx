"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  InputNumber,
} from "antd";
import type { UploadFile } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetWebsiteImagesQuery,
  useAddWebsiteImageMutation,
  useUpdateWebsiteImageMutation,
  useDeleteWebsiteImageMutation,
} from "@/services/websiteImagesApi";

// Interface for the image data structure from the API
interface WebsiteImage {
  _id: string;
  publicId: string;
  url: string;
  altText?: string;
  context?: string;
  filename?: string;
  belongsTo?: {
    resourceType: string;
    resourceId: string;
  };
  pageUrl?: string;
  width?: number;
  height?: number;
  order?: number;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

const WebsiteImagesPage: React.FC = () => {
  const { data, isLoading } = useGetWebsiteImagesQuery();
  const [addWebsiteImage] = useAddWebsiteImageMutation();
  const [updateWebsiteImage] = useUpdateWebsiteImageMutation();
  const [deleteWebsiteImage] = useDeleteWebsiteImageMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingImage, setEditingImage] = useState<WebsiteImage | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleAdd = () => {
    setEditingImage(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: WebsiteImage) => {
    setEditingImage(record);
    form.setFieldsValue({
      altText: record.altText,
      context: record.context,
      order: record.order,
      pageUrl: record.pageUrl,
    });
    // Set fileList to show existing image for edit
    if (record.url) {
      setFileList([
        {
          uid: record._id,
          name: record.publicId || "image.jpg",
          status: "done",
          url: record.url,
        } as UploadFile,
      ]);
    } else {
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWebsiteImage(id).unwrap();
      toast.success("Image deleted successfully");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const values = await form.validateFields();
      const formData = new FormData();

      // Use the new schema field names
      formData.append("altText", values.altText || "");
      formData.append("context", values.context || "");
      formData.append("order", values.order);
      formData.append("pageUrl", values.pageUrl || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (!editingImage) {
        // If adding a new image and no file is selected, show an error
        toast.error("Please select an image to upload.");
        setIsSubmitting(false);
        return;
      }

      if (editingImage) {
        await updateWebsiteImage({ id: editingImage._id, formData }).unwrap();
        toast.success("Image updated successfully");
      } else {
        await addWebsiteImage(formData).unwrap();
        toast.success("Image added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnsType<WebsiteImage> = [
    {
      title: "Image",
      dataIndex: "url",
      key: "url",
      render: (url) => (
        <img
          src={url}
          alt="website"
          style={{ width: 80, height: 80, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Alt Text",
      dataIndex: "altText",
      key: "altText",
    },
    {
      title: "Context",
      dataIndex: "context",
      key: "context",
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this image?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Image
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data || []}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title={editingImage ? "Edit Image" : "Add Image"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: isSubmitting }}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="altText"
            label="Alt Text"
            rules={[{ required: true, message: "Please enter alt text" }]}
          >
            <Input placeholder="Enter alt text" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="context"
            label="Context"
            rules={[{ required: true, message: "Please enter context" }]}
          >
            <Input
              placeholder="e.g., about-page-banner"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Order"
            initialValue={0}
            rules={[
              { required: true, message: "Please enter an order number" },
            ]}
          >
            <InputNumber min={0} disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="pageUrl"
            label="Page URL"
            rules={[{ required: true, message: "Please enter page URL" }]}
          >
            <Input placeholder="e.g., /about" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item label="Upload Image">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              disabled={isSubmitting}
              maxCount={1} // Allow only one file to be uploaded
            >
              <Button icon={<UploadOutlined />} disabled={isSubmitting}>
                Select Image
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsiteImagesPage;
