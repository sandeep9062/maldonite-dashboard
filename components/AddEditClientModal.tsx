"use client";

import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Select,
 
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
  useAddClientMutation,
  useUpdateClientMutation,
} from "../services/clientApi";

interface Props {
  open: boolean;
  onClose: () => void;
  editData: any | null;
}

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Education",
  "Manufacturing",
];

const AddEditClientModal: React.FC<Props> = ({ open, onClose, editData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const [addClient, { isLoading: adding }] = useAddClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();

  // 🧠 Pre-fill form when editing
  useEffect(() => {
    if (editData) {
      form.setFieldsValue({ ...editData });
      if (editData.icon) {
        setFileList([
          {
            uid: "-1",
            name: "logo.png",
            status: "done",
            url: editData.icon,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key]) formData.append(key, values[key]);
    });

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("logo", fileList[0].originFileObj);
    }

    try {
      if (editData) {
        await updateClient({ id: editData._id, formData }).unwrap();
    } else {
        await addClient(formData).unwrap();
      }
      form.resetFields();
      setFileList([]);
      onClose();
    } catch (error) {
      console.error("Error submitting client:", error);
    }
  };

  return (
    <Modal
      open={open}
      title={editData ? "Edit Client" : "Add Client"}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={adding || updating}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="Client Name" rules={[{ required: true }]}>
          <Input placeholder="e.g., Ignot Solutions" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
          <Input placeholder="client@example.com" />
        </Form.Item>

        <Form.Item name="phone" label="Phone">
          <Input placeholder="Phone number" />
        </Form.Item>

        <Form.Item name="website" label="Website">
          <Input placeholder="https://www.client.com" />
        </Form.Item>

        <Form.Item name="industry" label="Industry">
          <Select placeholder="Select industry">
            {industries.map((industry) => (
              <Select.Option key={industry} value={industry}>
                {industry}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} placeholder="Client address" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Short description" />
        </Form.Item>

        <Form.Item label="Logo">
          <Upload
            fileList={fileList}
            beforeUpload={() => false} // Prevent auto-upload
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*"
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Logo</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditClientModal;
