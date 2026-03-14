// src/app/new/page.tsx
"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Upload,
  Card,
  Typography,
  Space,
  Switch,
  InputNumber,
  Row,
  Col,
  Spin, // ✅ Imported Spin for loading indicator
} from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useAddBlogMutation } from "@/services/blogsApi";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import slugify from "slugify"; // ✅ Imported slugify for generating URL-friendly slugs

const { Title, Text } = Typography;
const { Option } = Select;

// New type to match form values, including file lists
interface BlogFormValues {
  title: string;
  slug: string; // ✅ Added slug to the form values interface
  desc: string;
  content: string;
  category: string;
  tags?: string[];
  readTime?: number;
  status: string;
  isFeatured?: boolean;
  author: string;
  date: dayjs.Dayjs;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  image?: UploadFile[];
  authorImage?: UploadFile[];
}

export default function BlogFormPage() {
  const [form] = Form.useForm<BlogFormValues>();
  const router = useRouter();
  const [addBlog, { isLoading }] = useAddBlogMutation();
  const [liveSlug, setLiveSlug] = React.useState<string>(""); // ✅ State to manage the live-generated slug

  // ✅ Helper function to extract a single file from the upload event
  // This ensures that even if multiple files are accidentally selected, only the first one is used.
  const normSingleFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList && e.fileList.length > 0 ? [e.fileList[0]] : [];
  };

  const categories = [
    "SaaS",
    "AI",
    "DevTools",
    "UI/UX",
    "Web Development",
    "Product",
    "SEO",
    "Marketing",
    "Cloud & DevOps",
    "Case Studies",
  ];

  const statusOptions = ["draft", "published", "archived"];

  // ✅ Handler for title input change to generate slug in real-time
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    // Generate a URL-friendly slug from the title
    const generatedSlug = slugify(newTitle, { lower: true, strict: true });
    setLiveSlug(generatedSlug); // Update the state for display
    form.setFieldsValue({ slug: generatedSlug }); // Update the slug field in the form
  };

  const onFinish = async (values: BlogFormValues) => {
    const formData = new FormData();

    // Append all form values to FormData
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof BlogFormValues];

      if (key === "image" || key === "authorImage") {
        // Handle image files, taking only the first file
        const fileList = value as UploadFile[];
        if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
          formData.append(key, fileList[0].originFileObj);
        }
      } else if (key === "tags" && Array.isArray(value)) {
        // Handle tags as an array of strings
        (value as string[]).forEach((tag) => formData.append("tags[]", tag));
      } else if (value !== undefined && value !== null) {
        // Handle date conversion and boolean values, then append all other fields
        if (key === "date") {
          formData.append(key, dayjs(value as dayjs.Dayjs).format("YYYY-MM-DD"));
        } else if (key === "isFeatured") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      await addBlog(formData).unwrap();
      message.success("Blog created successfully!");
      form.resetFields(); // ✅ Reset form fields on successful submission
      setLiveSlug(""); // ✅ Reset live slug state
      router.push("/blogs");
    } catch (err: any) {
      console.error("Failed to create blog:", err);
      // Display a more specific error message from the backend if available
      const errorMessage = err.data?.message || "Failed to create blog.";
      message.error(errorMessage);
    }
  };

  return (
    <Spin spinning={isLoading} tip="Creating Blog..."> {/* ✅ Wrap the entire form in Spin component */}
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "#f0f2f5" }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 1000,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: "24px 32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Create New Blog Post
            </Title>
            <Text type="secondary">
              Fill out the form below to publish a new blog post
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              category: "Web Development",
              author: "Team Maldonite",
              date: dayjs(),
              readTime: 5,
              isFeatured: false,
              status: "published",
              tags: [],
              slug: "", // Initialize slug
            }}
          >
            {/* Main Blog Details Section */}
            <Title
              level={4}
              style={{ marginTop: 0, marginBottom: 16, color: "#1f1f1f" }}
            >
              Post Details
            </Title>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input
                placeholder="Enter a compelling blog title"
                onChange={handleTitleChange} // ✅ Add onChange handler for live slug generation
              />
            </Form.Item>

            {/* ✅ Slug Input Field */}
            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true, message: "Please enter a slug" }]}
              tooltip="The URL-friendly version of the title. Automatically generated, but can be edited."
            >
              <Input
                placeholder="e.g., my-awesome-blog-post"
                value={liveSlug} // Bind value to liveSlug state
                onChange={(e) => setLiveSlug(e.target.value)} // Allow manual editing of the slug
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select placeholder="Select a category">
                    {categories.map((cat) => (
                      <Option key={cat} value={cat}>
                        {cat}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="readTime"
                  label="Read Time (min)"
                  rules={[
                    { required: true, message: "Please enter read time" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder="e.g., 5"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="desc"
              label="Short Description"
              rules={[
                {
                  required: true,
                  message: "Please enter a short description",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="A brief, engaging summary of the post..."
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[{ required: true, message: "Please enter blog content" }]}
            >
              <Input.TextArea
                rows={12}
                placeholder="Write your blog content here..."
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
              rules={[
                { required: true, message: "Please add at least one tag" },
              ]}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add keywords (e.g., Next.js, AI, SEO)"
                tokenSeparators={[","]}
              />
            </Form.Item>

            {/* Author Details Section */}
            <Title
              level={4}
              style={{ marginTop: 24, marginBottom: 16, color: "#1f1f1f" }}
            >
              Author & Publish Details
            </Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="author"
                  label="Author Name"
                  rules={[
                    { required: true, message: "Please enter author name" },
                  ]}
                >
                  <Input placeholder="e.g., Jane Doe" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="date"
                  label="Publish Date"
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[
                    { required: true, message: "Please select a status" },
                  ]}
                >
                  <Select placeholder="Select status">
                    {statusOptions.map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="isFeatured"
                  label="Is Featured?"
                  valuePropName="checked"
                  style={{ paddingTop: 30 }}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            {/* SEO Details Section */}
            <Title
              level={4}
              style={{ marginTop: 24, marginBottom: 16, color: "#1f1f1f" }}
            >
              SEO Details
            </Title>
            <Form.Item
              name="seoMetaTitle"
              label="SEO Meta Title"
              rules={[{ max: 60, message: "Title must be max 60 characters" }]}
            >
              <Input placeholder="Short SEO-friendly title (max 60 chars)" />
            </Form.Item>

            <Form.Item
              name="seoMetaDescription"
              label="SEO Meta Description"
              rules={[
                { max: 160, message: "Description must be max 160 characters" },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Meta description for search engines (max 160 chars)"
              />
            </Form.Item>

            {/* Image Uploads Section */}
            <Title
              level={4}
              style={{ marginTop: 24, marginBottom: 16, color: "#1f1f1f" }}
            >
              Image Uploads
            </Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="image"
                  label="Blog Cover Image"
                  valuePropName="fileList"
                  getValueFromEvent={normSingleFile} // ✅ Use normSingleFile
                  rules={[
                    {
                      required: true,
                      message: "Please upload a blog cover image",
                    },
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false} // Prevents auto-upload
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="authorImage"
                  label="Author Image"
                  valuePropName="fileList"
                  getValueFromEvent={normSingleFile} // ✅ Use normSingleFile
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false} // Prevents auto-upload
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            {/* Form Actions */}
            <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
              <Space size="middle">
                <Button size="large" onClick={() => router.push("/blogs")}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  style={{ minWidth: 180 }}
                >
                  Create Blog
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Spin>
  );
}
