"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Popconfirm,
  Image,
  Typography,
  Card,
  Spin,
} from "antd";
import type { Breakpoint } from 'antd/es';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
  useGetClientsQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} from "../../services/clientApi";
import { toast } from "sonner";
import ReusableTable from "../../components/ui/ReusableTable";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ClientsPage = () => {
  const { data, isLoading: isFetchingClients } = useGetClientsQuery();
  const [addClient, { isLoading: isAddingClient }] = useAddClientMutation();
  const [updateClient, { isLoading: isUpdatingClient }] = useUpdateClientMutation();
  const [deleteClient, { isLoading: isDeletingClient }] = useDeleteClientMutation();

  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  const isSubmitting = isAddingClient || isUpdatingClient;

  // ✅ Handle Add / Update
  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    // Append form fields
    for (const key in values) {
      if (values[key]) {
        formData.append(key, values[key]);
      }
    }

    // Append logo file if selected
    const file = fileList[0]?.originFileObj;
    if (file) {
      formData.append("logo", file);
    }

    try {
      if (editingClient) {
        await updateClient({ id: editingClient._id, formData }).unwrap();
        toast.success("Client updated successfully");
      } else {
        await addClient(formData).unwrap();
        toast.success("Client added successfully");
      }
      handleCancel();
    } catch (err) {
      console.error("Error saving client:", err);
      toast.error("Failed to save client");
    }
  };

  // ✅ Open modal (Add / Edit)
  const openModal = (client: any = null) => {
    setEditingClient(client);

    if (client) {
      form.setFieldsValue(client);
      if (client.icon) {
        setFileList([
          {
            uid: "-1",
            name: "icon.png",
            status: "done",
            url: client.icon,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  // ✅ Cancel modal
  const handleCancel = () => {
    setEditingClient(null);
    setModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  // ✅ Delete client
  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id).unwrap();
      toast.success("Client deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete client");
    }
  };

  // ✅ Table columns
  const columns = [
    {
      title: "Logo",
      dataIndex: "icon",
      key: "icon",
      render: (icon: string) =>
        icon ? (
          <Image
            src={icon}
            alt="logo"
            width={60}
            height={60}
            style={{ objectFit: "contain", borderRadius: "8px" }}
            preview={{ mask: <Text>Preview</Text> }}
          />
        ) : (
          <div style={{ width: 60, height: 60, backgroundColor: '#f0f2f5', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Text type="secondary">N/A</Text>
          </div>
        ),
    },
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
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      responsive: ['md'] as Breakpoint[],
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      responsive: ['lg'] as Breakpoint[],
      render: (website: string) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
            {website.replace(/https?:\/\//, '').split('/')[0]}
          </a>
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
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
        bordered={false}
        className="w-full max-w-6xl shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md"
        style={{ margin: "0 auto" }}
      >
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="mb-0! font-bold">Clients</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{
              background: "#1890ff",
              borderColor: "#1890ff",
              height: 40,
              padding: '0 24px',
              fontWeight: 600
            }}
          >
            Add Client
          </Button>
        </div>

        <Spin spinning={isFetchingClients || isDeletingClient} tip="Loading clients...">
          <ReusableTable
            dataSource={data?.data || []}
            columns={columns}
            rowKey="_id"
            bordered
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={
          <Title level={3} className="mb-0!">
            {editingClient ? "✏️ Edit Client" : "➕ Add Client"}
          </Title>
        }
        open={modalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingClient ? "Update" : "Create"}
        confirmLoading={isSubmitting}
        destroyOnClose
        width={800}
        style={{ top: 50 }}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter client name" }]}
          >
            <Input size="large" placeholder="Enter client name" />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="Email" name="email">
              <Input size="large" type="email" placeholder="Enter email address" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input size="large" placeholder="Enter phone number" />
            </Form.Item>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="Industry" name="industry">
              <Input size="large" placeholder="e.g. Technology, Finance" />
            </Form.Item>
            <Form.Item label="Website" name="website">
              <Input size="large" placeholder="https://example.com" />
            </Form.Item>
          </div>
          
          <Form.Item label="Address" name="address">
            <Input size="large" placeholder="Enter address" />
          </Form.Item>
          
          <Form.Item label="Description" name="description">
            <TextArea
              rows={3}
              placeholder="Short description about the client"
            />
          </Form.Item>

          <Form.Item label="Icon / Logo">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
