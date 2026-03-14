"use client";

import React from "react";
import { Table } from "antd";
import type { TableProps } from "antd";

interface ReusableTableProps<T extends object> extends TableProps<T> {
  // You can add any custom props here if needed
}

const ReusableTable = <T extends object>(props: ReusableTableProps<T>) => {
  return (
    <Table
      {...props}
      rowKey={(record) => (record as any)._id || (record as any).id}
      bordered
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        defaultPageSize: 10,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        ...props.style,
      }}
    />
  );
};

export default ReusableTable;
