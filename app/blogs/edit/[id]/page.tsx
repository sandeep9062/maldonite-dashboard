"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Switch,
  InputNumber,
  Upload,
  Spin,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { useGetBlogByIdQuery, useUpdateBlogMutation } from "@/services/blogsApi";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import slugify from "slugify";

const { Title, Text } = Typography;
const { Option } = Select;

// A more specific type for the form values
interface BlogFormValues {
  _id: string; // Keep _id for identification, but it's not a form field to be sent
  title: string;
  slug: string;
  desc: string;
  content: string;
  image?: UploadFile[];
  category: string;
  tags?: string[];
  author: string;
  authorImage?: UploadFile[];
  date: Dayjs;
  readTime?: number;
  isFeatured?: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  status: "draft" | "published" | "archived";
}

export default function EditBlogFormPage() {
  const [form] = Form.useForm<BlogFormValues>();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // State to manage the live-generated slug
  const [liveSlug, setLiveSlug] = useState<string>("");

  const {
    data: blog,
    isLoading: isFetching,
    isError: isFetchError,
  } = useGetBlogByIdQuery(id as string, { skip: !id });
  const [updateBlog, { isLoading: isUpdating, isSuccess }] =
    useUpdateBlogMutation();

  // Helper function to extract a single file from the upload event
  const normSingleFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList && e.fileList.length > 0 ? [e.fileList[0]] : [];
  };

  // Handler for title input change to generate slug in real-time
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const generatedSlug = slugify(newTitle, { lower: true, strict: true });
    setLiveSlug(generatedSlug);
    form.setFieldsValue({ slug: generatedSlug });
  };

  // Effect to populate the form with blog data
  useEffect(() => {
    if (blog) {
      const initialValues: Partial<BlogFormValues> = {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        desc: blog.desc,
        content: blog.content,
        category: blog.category,
        tags: blog.tags || [],
        author: blog.author,
        date: dayjs(blog.date),
        readTime: blog.readTime || 5,
        isFeatured: blog.isFeatured || false,
        seoMetaTitle: blog.seoMetaTitle,
        seoMetaDescription: blog.seoMetaDescription,
        status: blog.status || "draft",
      };

      // Set liveSlug for the slug input field
      setLiveSlug(blog.slug);

      // Handle image fields separately to create Antd's UploadFile[]
      if (blog.image) {
        initialValues.image = [
          { uid: "-1", name: "blog-image.png", status: "done", url: blog.image },
        ];
      }
      if (blog.authorImage) {
        initialValues.authorImage = [
          { uid: "-2", name: "author-image.png", status: "done", url: blog.authorImage },
        ];
      }

      form.setFieldsValue(initialValues);
    }
  }, [blog, form]);

  // Handle successful update and navigation
  useEffect(() => {
    if (isSuccess) {
      message.success("Blog updated successfully!");
      router.push("/blogs");
    }
  }, [isSuccess, router]);

  const onFinish = async (values: BlogFormValues) => {

    const formData = new FormData();
    // Append all form values
    Object.entries(values).forEach(([key, value]) => {
      // Skip file fields and _id, handle others
      if (key !== "image" && key !== "authorImage" && key !== "_id" && value !== undefined) {
        if (key === "date") {
          formData.append(key, dayjs(value as Dayjs).format("YYYY-MM-DD"));
        } else if (key === "tags") {
          (value as string[]).forEach((tag) => formData.append("tags[]", tag));
        } else if (key === "isFeatured") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Handle image file updates
    const newCoverImageFile = values.image?.[0]?.originFileObj;
    // Only append new file if it's actually a new selection or different from existing
    if (newCoverImageFile) {
      formData.append("image", newCoverImageFile);
    } else if (blog?.image && !values.image?.length) {
      // If there was an old image but no new one, and the user removed it
      formData.append("image", ""); // Explicitly send empty to clear on backend
    }


    const newAuthorImageFile = values.authorImage?.[0]?.originFileObj;
    if (newAuthorImageFile) {
      formData.append("authorImage", newAuthorImageFile);
    } else if (blog?.authorImage && !values.authorImage?.length) {
      // If there was an old author image but no new one, and the user removed it
      formData.append("authorImage", ""); // Explicitly send empty to clear on backend
    }

    try {
      // ✅ Pass blog._id to the update mutation instead of the slug.
      // The API endpoint expects the document ID for PUT requests.
      if (blog?._id) {
          await updateBlog({ id: blog._id, formData }).unwrap();
      } else {
          message.error("Blog ID is missing. Cannot update.");
      }
    } catch (err: any) {
      console.error("Failed to update blog:", err);
      const errorMessage = err.data?.message || "Failed to update blog.";
      message.error(errorMessage);
    }
  };

  const categories = [
    "All",
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

  if (isFetching)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading blog data..." />
      </div>
    );
  if (isFetchError || !blog)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text type="danger">Error loading blog or blog not found.</Text>
      </div>
    );

  return (
    <Spin spinning={isUpdating} tip="Updating Blog...">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card
          style={{
            width: "100%",
            maxWidth: 900,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: "24px 32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Edit Blog Post
            </Title>
            <Text type="secondary">Update the details for your blog post</Text>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Post Details */}
            <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
              Post Details
            </Title>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input
                placeholder="Enter a compelling blog title"
                onChange={handleTitleChange}
              />
            </Form.Item>

            {/* Slug Input Field */}
            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true, message: "Please enter a slug" }]}
              tooltip="The URL-friendly version of the title. Automatically generated, but can be edited."
            >
              <Input
                placeholder="e.g., my-awesome-blog-post"
                value={liveSlug}
                onChange={(e) => setLiveSlug(e.target.value)}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
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
              <Col span={12}>
                <Form.Item
                  name="readTime"
                  label="Read Time (min)"
                  rules={[{ required: true, message: "Please enter read time" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="desc"
              label="Short Description"
              rules={[
                { required: true, message: "Please enter a short description" },
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
              rules={[{ required: true, message: "Please add at least one tag" }]}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add keywords (e.g., Next.js, AI, SEO)"
                tokenSeparators={[","]}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select a status" }]}
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
              <Col span={8}>
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

            {/* Author Details */}
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              Author & Publish Details
            </Title>
            <Row gutter={16}>
              <Col span={12}>
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
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Publish Date"
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* SEO Details */}
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
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

            {/* Image Uploads */}
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              Image Uploads
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="image"
                  label="Blog Cover Image"
                  valuePropName="fileList"
                  getValueFromEvent={normSingleFile}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="authorImage"
                  label="Author Image"
                  valuePropName="fileList"
                  getValueFromEvent={normSingleFile}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
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
                  loading={isUpdating}
                  disabled={isUpdating}
                  style={{ minWidth: 180 }}
                >
                  Update Blog
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Spin>
  );
}
