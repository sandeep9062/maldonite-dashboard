"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Input, Select, Button, Tag } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import type { UploadFile } from "antd/es/upload/interface";
import { useAddProjectMutation } from "@/services/projectsApi";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

interface FormState {
  title: string;
  live: string;
  type: string;
  github: string;
  description: string;
  clientName: string;
  place: string;
  timeDuration: string;
  cost: string;
  technologiesUsed: string[];
  deployment: string;
  features: string[];
  specialFeature: string;
  numberOfPages: string;
}

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

export default function AddProjectPage() {
  const router = useRouter();
  const [addProject, { isLoading }] = useAddProjectMutation();

  const [form, setForm] = useState<FormState>({
    title: "",
    live: "", // Corrected from 'link' to 'live'
    type: "WEB",
    github: "",
    description: "",
    clientName: "",
    place: "",
    timeDuration: "",
    cost: "",
    technologiesUsed: [], // Changed to an array for Select component
    deployment: "",
    features: [], // Changed to an array for Select component
    specialFeature: "",
    numberOfPages: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.type) return toast.error("Select project type");

    try {
      const data = new FormData();
      const slug = slugify(form.title);
      data.append("slug", slug);

      // Correctly append non-array form data
      Object.entries(form).forEach(([key, value]) => {
        if (value && !Array.isArray(value)) {
          data.append(key, value as string);
        }
      });

      // Correctly append array data
      form.technologiesUsed.forEach((tech) =>
        data.append("technologiesUsed", tech)
      );
      form.features.forEach((feature) => data.append("features", feature));

      // Append images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          data.append("image", file.originFileObj);
        }
      });

      await addProject(data).unwrap();
      toast.success("Project added successfully!");
      router.push("/projects");
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Error adding project");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Add New Project
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title & Live Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              size="large"
              placeholder="Project Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              size="large"
              placeholder="Live Project Link"
              value={form.live}
              onChange={(e) => setForm({ ...form, live: e.target.value })}
            />
          </div>

          {/* Type & Github */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              size="large"
              value={form.type}
              onChange={(val) => setForm({ ...form, type: val })}
              options={projectTypes.map((t) => ({ label: t, value: t }))}
              className="w-full"
            />
            <Input
              size="large"
              placeholder="Github Repository URL"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
            />
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              size="large"
              placeholder="Client Name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <Input
              size="large"
              placeholder="Client Location"
              value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}
            />
            <Input
              size="large"
              placeholder="Duration (e.g., 3 months)"
              value={form.timeDuration}
              onChange={(e) =>
                setForm({ ...form, timeDuration: e.target.value })
              }
            />
          </div>

          {/* Cost & Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              size="large"
              placeholder="Cost (e.g., 5000)"
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
            <Input
              size="large"
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
            placeholder="Project Description"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            size="large"
            placeholder="Special Feature"
            value={form.specialFeature}
            onChange={(e) =>
              setForm({ ...form, specialFeature: e.target.value })
            }
          />

          {/* Image Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Upload Project Images
            </h2>
            <Dragger
              multiple
              accept="image/*"
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
              listType="picture-card"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
              </p>
              <p className="ant-upload-text font-medium">
                Click or drag images here
              </p>
              <p className="ant-upload-hint text-gray-500">
                Supports multiple image uploads
              </p>
            </Dragger>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {isLoading ? "Saving..." : "Save Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
