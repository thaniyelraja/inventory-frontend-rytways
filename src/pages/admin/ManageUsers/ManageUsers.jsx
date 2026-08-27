import { useQuery } from "@tanstack/react-query";
import DataTable from "../../../components/DataTable/DataTable";
import { Button, message, Tag } from "antd";
import { useEffect, useState } from "react";
import { getUsers } from "../../../utils/user";
import { MoreOutlined } from "@ant-design/icons";

const ManageUsers = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const {
    data: returnUsers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["manage-users", page, size, search],
    queryFn: () => getUsers(page, size, search),
  });

  const getErrorMessage = (error) => {
    if (!error?.response) {
      return "Unable to connect to the server.";
    }
    switch (error.response.status) {
      case 404:
        return "users not found";
      case 500:
        return "Internal server error";
      default:
        return error.response?.data?.message || "Something went wrong.";
    }
  };

  useEffect(() => {
    if (isError) {
      message.error(getErrorMessage(error), 1.5);
    }
  }, [isError, error]);

  const users = returnUsers?.content ?? [];

  const columns = [ 
    {
      title: "S.No",
      key: "serialNumber",
      width: 70,
      render: (_, __, index) => {
        return page * size + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag>{role}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return (
          <div>
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={() => {
                console.log("User: ", record);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <DataTable
        title="Manage Users"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        searchPlaceholder="Search users..."
        onSearch={(value) => {
          setSearch(value);
          setPage(0);
        }}
        pagination={{
          page,
          size,
          total: returnUsers?.totalElements ?? 0,
          setPage,
          setSize,
        }}
        tableHeight={350}
      />
    </div>
  );
};

export default ManageUsers;
