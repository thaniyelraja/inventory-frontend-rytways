import { Button, Card, Dropdown, message } from "antd";
import DataTable from "../../components/DataTable/DataTable";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreOutlined } from "@ant-design/icons";
import {
  deleteInventoryRequest,
  getInventoryRequest,
} from "../../utils/inventoryRequest";
import { getUser } from "../../utils/auth";
import { useInventoryRequest } from "../../context/useInventoryRequest";
import InventoryRequestModal from "../../components/InventoryRequestModal/InventoryRequestModal";
import StatusTag from "../../components/StatusTag/StatusTag";
import DateFormatter from "../../components/DateFormatter/DateFormatter";
import AppModal from "../../components/AppModal/AppModal";
import SingleRequestModal from "../../components/SingleRequestModal/SingleRequestModal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";

const InventoryRequest = () => {
  const { setRequest, requestSingleOpen, setRequestSingleOpen } =
    useInventoryRequest();
  const user = getUser();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
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
            onClick={() => setSelectedRequest(record)}
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
      render: (_, record) => {
        const items =
          record.requestStatus === "PENDING"
            ? [
                {
                  key: "edit",
                  label: "Edit",
                },
                {
                  key: "cancel",
                  label: "Cancel",
                },
              ]
            : [
                {
                  key: "view",
                  label: "View",
                },
              ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === "edit") {
                  setEditingRequest(record);
                  setRequestSingleOpen(true);
                }
                if (key === "cancel") {
                  ConfirmationModal({
                    title: "Cancel Request",
                    content: "Are you sure you want to can cel this request?",
                    okText: "Yes, Cancel",
                    cancelText: "No",
                    onConfirm: async () => {
                      try {
                        console.log(record);
                        await deleteInventoryRequest(record.inventoryRequestId);
                        message.success("Request canceled successfully", 1.5);
                        await refetch();
                      } catch (error) {
                        message.error(
                          error?.response?.data?.message ||
                            error?.message ||
                            "Failed to cancel request",
                          2,
                        );
                      }
                    },
                  });
                }
                if (key === "view") {
                  setSelectedRequest(record);
                }
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
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
            rowKey="inventoryRequestId"
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
      <SingleRequestModal
        requestSingleOpen={requestSingleOpen}
        setRequestSingleOpen={setRequestSingleOpen}
        material={editingRequest?.material}
        user={user}
        request={editingRequest}
        mode="edit"
        onSuccess={refetch}
      />
      <AppModal
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`${selectedRequest?.requestStatus} Request Status`}
        width={400}
      >
        {selectedRequest?.requestStatus === "PENDING" && (
          <div>
            <p>
              <strong>Requested Quantity : </strong>
              {selectedRequest?.requestQuantity}{" "}
              {selectedRequest?.material?.unit}
            </p>
            <p>
              <strong>Requested At : </strong>
              <DateFormatter date={selectedRequest?.requestedAt} />
            </p>
          </div>
        )}
        {selectedRequest?.requestStatus === "APPROVED" && (
          <div>
            <p>
              <strong>Approved quantity : </strong>
              {selectedRequest?.approvedQuantity || "-"}
            </p>
            <p>
              <strong>Approval remarks : </strong>
              {selectedRequest?.approvalRemarks || "-"}
            </p>
            <p>
              <strong>Approved At : </strong>
              <DateFormatter date={selectedRequest?.approvedAt} />
            </p>
          </div>
        )}
        {selectedRequest?.requestStatus === "REJECTED" && (
          <div>
            <p>
              <strong>Rejection Remarks : </strong>
              {selectedRequest?.rejectionRemarks || "-"}
            </p>
            <p>
              <strong>Rejected At : </strong>
              <DateFormatter date={selectedRequest?.rejectedAt} />
            </p>
          </div>
        )}
      </AppModal>
    </>
  );
};

export default InventoryRequest;
