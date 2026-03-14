"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Button, Typography } from "antd";
import {
  HomeOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  UserAddOutlined,
  TeamOutlined,
  RocketOutlined,
  AppstoreAddOutlined,
  BuildOutlined,
  BookOutlined,
  CameraOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;
const { Title } = Typography;

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // initialize on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getSelectedKey = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/enqueries")) return "enqueries";
    if (pathname.startsWith("/leads")) return "leads";
    if (pathname.startsWith("/clients")) return "clients";
    if (pathname.startsWith("/maldo")) return "maldo";
    if (pathname.startsWith("/services")) return "services";
    if (pathname.startsWith("/saas-products")) return "saas-products";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname.startsWith("/blogs")) return "blogs";
    if (pathname.startsWith("/testimonials")) return "testimonials";
    if (pathname.startsWith("/website-images")) return "website-images";
    if (pathname.startsWith("/site-settings")) return "site-settings";
    return "";
  };

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: <Link href="/">Home</Link> },
    {
      key: "enqueries",
      icon: <QuestionCircleOutlined />,
      label: <Link href="/enqueries">Enquiries</Link>,
    },
    {
      key: "services",
      icon: <CustomerServiceOutlined />,
      label: <Link href="/services">Services</Link>,
    },
    {
      key: "leads",
      icon: <UserAddOutlined />,
      label: <Link href="/leads">Leads</Link>,
    },
    {
      key: "clients",
      icon: <TeamOutlined />,
      label: <Link href="/clients">Clients</Link>,
    },
    {
      key: "maldo",
      icon: <RocketOutlined />,
      label: <Link href="/maldo">Maldo AI</Link>,
    },
    {
      key: "saas-products",
      icon: <AppstoreAddOutlined />,
      label: <Link href="/saas-products">SaaS Products</Link>,
    },
    {
      key: "projects",
      icon: <BuildOutlined />,
      label: <Link href="/projects">Projects</Link>,
    },
    {
      key: "blogs",
      icon: <BookOutlined />,
      label: <Link href="/blogs">Blogs</Link>,
    },
    {
      key: "website-images",
      icon: <CameraOutlined />,
      label: <Link href="/website-images">Website Images</Link>,
    },
    {
      key: "testimonials",
      icon: <CameraOutlined />,
      label: <Link href="/testimonials">Testimonials</Link>,
    },
    {
      key: "site-settings",
      icon: <SettingOutlined />,
      label: <Link href="/site-settings">Site Settings</Link>,
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(val) => !isMobile && setCollapsed(val)}
      collapsedWidth={isMobile ? 0 : 80}
      trigger={isMobile ? null : undefined}
      width={220}
      className="bg-gray-900! min-h-screen shadow-xl flex flex-col"
    >
      {/* Logo and toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 group">
            <Avatar
              src="/images/ignot-logo1.png"
              size="large"
              className="bg-white p-1"
            />
            <Title
              level={5}
              className="m-0! text-white! font-bold! tracking-wide group-hover:text-blue-400! transition-colors"
            >
              MALDONITE
            </Title>
          </Link>
        )}
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-white!"
          />
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        className="bg-transparent border-0 mt-4 grow"
        items={menuItems}
      />

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          className="flex items-center justify-center rounded-lg shadow-md bg-red-600 hover:bg-red-700 border-0"
        >
          {!collapsed && "Logout"}
        </Button>
      </div>
    </Sider>
  );
};
