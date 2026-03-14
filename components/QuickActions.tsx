"use client";
import React from "react";
import { Button } from "antd";
import {
  PlusOutlined,
  UserAddOutlined,
  FileTextOutlined,
  EditOutlined,
  MailOutlined,
} from "@ant-design/icons";

export default function QuickActions() {
  const actions = [
    {
      label: "Projects",
      onClick: () => alert("open create project modal"),
      type: "primary",
      icon: <PlusOutlined />,
    },
    {
      label: "Clients",
      onClick: () => alert("open add client modal"),
      type: "default",
      icon: <UserAddOutlined />,
    },
    {
      label: "Raise Invoice",
      onClick: () => alert("open invoice modal"),
      type: "default",
      icon: <FileTextOutlined />,
    },
    {
      label: "Write Blog",
      onClick: () => alert("open blog editor"),
      type: "default",
      icon: <EditOutlined />,
    },
    {
      label: "Enquiries",
      onClick: () => alert("open enquiry form"),
      type: "default",
      icon: <MailOutlined />,
    },
    
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map(({ label, onClick, type, icon }) => (
        <Button
          key={label}
          type={type as "primary" | "default"}
          icon={icon}
          onClick={onClick}
          className="transition-transform duration-300 ease-in-out hover:scale-105"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
