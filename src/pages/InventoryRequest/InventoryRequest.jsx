import { Button, Card } from "antd";
import DataTable from "../../components/DataTable/DataTable";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreOutlined } from "@ant-design/icons";
import { getInventoryRequest } from "../../utils/inventoryRequest";
import { getUser } from "../../utils/auth";
import { useInventoryRequest } from "../../context/useInventoryRequest";
import InventoryRequestModal from "../../components/InventoryRequestModal/InventoryRequestModal";
import StatusTag from "../../components/StatusTag/StatusTag";
import DateFormatter from "../../components/DateFormatter/DateFormatter";

const InventoryRequest = () => {
  const { setRequest } = useInventoryRequest();
  const user = getUser();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const {
    data: returnRequests,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["inventoryRequests", page, size, search, status, user.userId],
    queryFn: () => getInventoryRequest(page, size, search, status, user.userId),
    enabled: !!user?.userId,
  });
  const requests = returnRequests?.content ?? [];
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
      title: "Material Code",
      dataIndex: ["material", "materialCode"],
      key: "materialCode",
    },
    {
      title: "Material Name",
      dataIndex: ["material", "materialName"],
      key: "materiaName",
    },
    {
      title: "Requested Quantity",
      dataIndex: "requestQuantity",
      key: "requestQuantity",
    },
    {
      title: "Unit",
      dataIndex: ["material", "unit"],
      key: "unit",
    },
    {
      title: "Status",
      dataIndex: "requestStatus",
      key: "requestStatus",
      align: "center",
      render: (status, record) => {
        return (
          <StatusTag
            status={status}
            onClick={() => {
              console.log("Selected request: ", record);
            }}
          />
        );
      },
    },
    {
      title: "Requested At",
      dataIndex: "requestedAt",
      key: "requestedAt",
      align: "center",
      render: (date) => {
        return <DateFormatter date={date} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: () => {
        return (
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(_, record) => {
              console.log("Request:", record);
            }}
          ></Button>
        );
      },
    },
  ];

  return (
    <>
      <div>
        <Card>
          <DataTable
            title="Inventory Requests"
            columns={columns}
            dataSource={requests}
            loading={isLoading}
            showSearch
            searchPlaceholder="Search by material code or name..."
            onSearch={(value) => {
              setSearch(value);
              setPage(0);
            }}
            showFullScreen
            showAddBtn
            onAdd={() => setRequest(true)}
            showFilter
            filterOptions={[
              {
                label: "All",
                key: "ALL",
              },
              {
                label: "Pending",
                key: "PENDING",
              },
              {
                label: "Approved",
                key: "APPROVED",
              },
              {
                label: "Rejected",
                key: "REJECTED",
              },
            ]}
            onFilter={(value) => {
              setStatus(value);
              setPage(0);
            }}
            tableHeight={350}
            onExport={() => console.log("Exported")}
            showPagination
            pagination={{
              page,
              size,
              total: returnRequests?.totalElements ?? 0,
              setPage,
              setSize,
            }}
          />
        </Card>
      </div>
      <InventoryRequestModal onSuccess={refetch} />
    </>
  );
};

export default InventoryRequest;
