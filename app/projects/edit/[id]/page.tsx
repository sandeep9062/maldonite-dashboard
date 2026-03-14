"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Upload, Button, Input, Select, Spin, Image, Popconfirm } from "antd";
import { toast } from "sonner";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "@/services/projectsApi";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

const projectTypes = [
  "OTHER",
  "WEB",
  "SAAS",
  "DIGITAL MARKETING",
  "MOBILE",
  "AI",
];

// Helper to create a URL-friendly slug
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: project, isFetching } = useGetProjectByIdQuery(id as string);
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    live: "",
    type: "",
    github: "",
    description: "",
    clientName: "",
    place: "",
    timeDuration: "",
    cost: "",
    technologiesUsed: [] as string[],
    deployment: "",
    features: [] as string[],
    specialFeature: "",
    numberOfPages: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        slug: project.slug || "",
        live: project.live || "",
        type: project.type || "",
        github: project.github || "",
        description: project.description || "",
        clientName: project.clientName || "",
        place: project.place || "",
        timeDuration: project.timeDuration || "",
        cost: project.cost?.toString() || "",
        technologiesUsed: project.technologiesUsed || [],
        deployment: project.deployment || "",
        features: project.features || [],
        specialFeature: project.specialFeature || "",
        numberOfPages: project.numberOfPages?.toString() || "",
      });
      setExistingImages(project.image || []);
    }
  }, [project]);

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");

    try {
      const data = new FormData();
      // ✅ FIX: Append slug as a single string explicitly
      data.append("slug", slugify(form.title));

      // Append all other form values
      Object.entries(form).forEach(([key, value]) => {
        // ✅ FIX: Don't append slug here, as it's handled above
        if (key !== "slug" && value && !Array.isArray(value)) {
          data.append(key, value as string);
        }
      });

      // Correctly append array data
      form.technologiesUsed.forEach((tech) =>
        data.append("technologiesUsed", tech)
      );
      form.features.forEach((feature) => data.append("features", feature));

      // Append existing images that are kept
      existingImages.forEach((imageUrl) => {
        data.append("existingImages", imageUrl);
      });

      // Append new images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          data.append("image", file.originFileObj);
        }
      });

      await updateProject({ id: id as string, formData: data }).unwrap();
      toast.success("Project updated successfully!");
      router.push("/projects");
    } catch (err) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error.data?.message || error?.message || "Error updating project"
      );
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input now also sets the slug */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => {
              setForm({
                ...form,
                title: e.target.value,
                slug: slugify(e.target.value), // Automatically update slug
              });
            }}
            required
          />
          {/* ✅ The slug is automatically generated, no manual input needed */}
          <div className="bg-gray-100 p-2 rounded-md">
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="text-gray-800 break-all">{slugify(form.title)}</p>
          </div>
        </div>

        {/* Live Link & Github */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Live Link"
            value={form.live}
            onChange={(e) => setForm({ ...form, live: e.target.value })}
          />
          <Input
            placeholder="Github URL"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
          />
        </div>

        {/* Type & Client Info */}
        <div className="grid grid-cols-3 gap-4">
          <Select
            placeholder="Select Project Type"
            value={form.type}
            onChange={(val) => setForm({ ...form, type: val })}
            options={projectTypes.map((t) => ({ label: t, value: t }))}
          />
          <Input
            placeholder="Client Name"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />
          <Input
            placeholder="Place"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
          />
        </div>

        {/* Time Duration, Cost & Pages */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="Time Duration (e.g., 3 months)"
            value={form.timeDuration}
            onChange={(e) => setForm({ ...form, timeDuration: e.target.value })}
          />
          <Input
            placeholder="Cost (e.g., 5000)"
            type="number"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
          />
          <Input
            placeholder="Number of Pages"
            type="number"
            value={form.numberOfPages}
            onChange={(e) =>
              setForm({ ...form, numberOfPages: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <TextArea
          placeholder="Description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        {/* Features & Tech */}
        <Select
          size="large"
          mode="tags"
          placeholder="Features (Add tags and press Enter)"
          value={form.features}
          onChange={(val: string[]) => setForm({ ...form, features: val })}
          className="w-full"
        />
        <Select
          size="large"
          mode="tags"
          placeholder="Technologies Used (Add tags and press Enter)"
          value={form.technologiesUsed}
          onChange={(val: string[]) =>
            setForm({ ...form, technologiesUsed: val })
          }
          className="w-full"
        />

        {/* Special Feature */}
        <Input
          placeholder="Special Feature"
          value={form.specialFeature}
          onChange={(e) => setForm({ ...form, specialFeature: e.target.value })}
        />

        {/* Image Display & Upload */}
        <div>
          <label className="block mb-2 font-medium">Existing Images</label>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((img) => (
              <div key={img} className="relative">
                <Image width={100} height={100} src={img} alt="existing" />
                <Popconfirm
                  title="Delete this image?"
                  onConfirm={() => handleRemoveExistingImage(img)}
                >
                  <Button
                    danger
                    shape="circle"
                    icon={<DeleteOutlined />}
                    size="small"
                    className="absolute top-1 right-1"
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Upload New Images</label>
          <Dragger
            multiple
            accept="image/*"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleFileChange}
            listType="picture-card"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag images here</p>
          </Dragger>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {isLoading ? "Updating..." : "Update Project"}
        </button>
      </form>
    </div>
  );
}
