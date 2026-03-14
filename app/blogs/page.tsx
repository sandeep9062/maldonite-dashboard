// src/app/blogs/page.tsx
"use client";

import React from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Typography,
  Card,
  Spin,
  Tooltip,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGetBlogsQuery, useDeleteBlogMutation } from "@/services/blogsApi";

// ✅ Define the Blog interface to ensure type safety
interface Comment {
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  desc: string;
  content: string;
  image?: string;
  category: string;
  tags: string[];
  author: string;
  authorImage?: string;
  date: string;
  readTime: number;
  views: number;
  likes: number;
  isFeatured: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  status: "draft" | "published" | "archived";
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

const { Title, Text } = Typography;

export default function BlogListPage() {
  const router = useRouter();
  const { data: blogs, isLoading } = useGetBlogsQuery();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id).unwrap();
      message.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      message.error("Failed to delete blog");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (url?: string) =>
        url ? (
          <img
            src={url}
            alt="cover"
            style={{
              width: 80,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 60,
              backgroundColor: "#f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
            }}
          >
            <Text type="secondary">No Image</Text>
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Blog) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => router.push(`/blogs/edit/${record._id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={isDeleting}
          >
            <Tooltip title="Delete">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundImage: "url('/backgrounds/lead-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "48px 24px",
      }}
    >
      <Card
        variant="borderless"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          padding: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Blog Posts
          </Title>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push("/blogs/new")}
          >
            New Blog
          </Button>
        </div>
        <Spin spinning={isLoading || isDeleting} description="Loading blogs...">
          <Table
            columns={columns}
            dataSource={blogs || []}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            style={{ width: "100%" }}
          />
        </Spin>
      </Card>
    </div>
  );
}
