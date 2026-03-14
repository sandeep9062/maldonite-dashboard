"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Divider,
  Space,
  InputNumber,
} from "antd";
import { toast } from "sonner";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useGetSiteSettingsQuery,
  useCreateSiteSettingsMutation,
  useUpdateSiteSettingsMutation,
} from "@/services/siteSettingsApi";

interface SiteSettingsFormValues {
  websiteName: string;
  websiteUrl: string;
  email: string;
  mainOffice: string;
  branchOffice: string;
  googleMapUrl: string;
  contactNo1: string;
  contactNo2: string;
  whatsAppNo: string;
  GSTNO: string;
  accountName: string;
  accountNumber: string;
  IFSCcode: string;
  branch: string;
  logoUrl: string;
  bannerUrl: string;
  favicon: string;

  // Socials
  facebook: string;
  instagram: string;
  twitter: string;
  youtubeUrl: string;
  linkedin: string;
  pinterest: string;
  github: string;

  // Stats
  clientsServed: number;
  projectsCompleted: number;
  industriesServed: number;
  aiIntegrations: number;
  countriesReached: number;
  foundedIn: number;
  SAASProducts: number;

  // Company info
  language: string;
  country: string;
}

const SiteSettingsPage = () => {
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetSiteSettingsQuery();
  const [createSettings, { isLoading: isCreating }] =
    useCreateSiteSettingsMutation();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSiteSettingsMutation();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const onFinish = async (values: SiteSettingsFormValues) => {
    try {
      if (data?._id) {
        await updateSettings({ id: data._id, ...values }).unwrap();
        toast.success("Site settings updated successfully!");
      } else {
        await createSettings(values).unwrap();
        toast.success("Site settings created successfully!");
      }

      refetch();
    } catch (err) {
      toast.error("Failed to save site settings.");
    }
  };

  return (
    <>
      <Card
        title="Website Site Settings"
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {isLoading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "40px auto" }}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ padding: "16px 8px" }}
          >
            {/* 🔹 Basic Information */}
            <Divider>Basic Information</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Website Name"
                  name="websiteName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter website name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Website URL" name="websiteUrl">
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input placeholder="admin@example.com" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Main Office" name="mainOffice">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Branch Office" name="branchOffice">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Google Map URL"
                  name="googleMapUrl"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="https://maps.google.com/?q=123+Digital+Blvd" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Google Map Embedded URL"
                  name="googleMapImbededUrl"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="https://www.google.com/maps/embed?pb=..." />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Contact */}
            <Divider>Contact Details</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Contact No 1"
                  name="contactNo1"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="+911234567890" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Contact No 2" name="contactNo2">
                  <Input placeholder="+911234567891" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="WhatsApp No"
                  name="whatsAppNo"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="+911234567890" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="GST No" name="GSTNO">
                  <Input placeholder="ABCD1234X" />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Bank */}
            <Divider>Bank Details</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item label="Account Name" name="accountName">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Account Number" name="accountNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="IFSC Code" name="IFSCcode">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Branch" name="branch">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Stats */}
            <Divider>Company Stats</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <Form.Item label="Clients Served" name="clientsServed">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Projects Completed" name="projectsCompleted">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Industries Served" name="industriesServed">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="AI Integrations" name="aiIntegrations">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Countries Reached" name="countriesReached">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Founded In" name="foundedIn">
                  <InputNumber
                    min={1900}
                    max={2100}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="SaaS Products" name="SAASProducts">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Company Info */}
            <Divider>Company Info</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item label="Language" name="language">
                  <Input placeholder="English" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Country" name="country">
                  <Input placeholder="India" />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Social Media */}
            <Divider>Social Media</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item label="Facebook" name="facebook">
                  <Input placeholder="https://facebook.com/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Instagram" name="instagram">
                  <Input placeholder="https://instagram.com/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Twitter" name="twitter">
                  <Input placeholder="https://twitter.com/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="YouTube" name="youtubeUrl">
                  <Input placeholder="https://youtube.com/yourchannel" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="LinkedIn" name="linkedin">
                  <Input placeholder="https://linkedin.com/company/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Pinterest" name="pinterest">
                  <Input placeholder="https://pinterest.com/yourpage" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="GitHub" name="github">
                  <Input placeholder="https://github.com/yourorg" />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Branding */}
            <Divider>Branding</Divider>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item label="Logo URL" name="logoUrl">
                  <Input placeholder="https://example.com/logo.png" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Banner URL" name="bannerUrl">
                  <Input placeholder="https://example.com/banner.jpg" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Favicon URL" name="favicon">
                  <Input placeholder="https://example.com/favicon.ico" />
                </Form.Item>
              </Col>
            </Row>

            {/* 🔹 Actions */}
            <Divider />
            <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  Save Settings
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                  Reload
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
};

export default SiteSettingsPage;
