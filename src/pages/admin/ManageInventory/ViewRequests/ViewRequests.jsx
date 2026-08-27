import { Modal, Tag } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../../../components/DataTable/DataTable";
import { getInventoryRequestsView } from "../../../../utils/inventoryRequest";
import styles from "./ViewRequests.module.css";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import DateFormatter from "../../../../components/DateFormatter/DateFormatter";

const ViewRequests = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { data: returnRequests, isLoading } = useQuery({
    queryKey: ["admin-view-requests", page, size, search, status],
    queryFn: () => getInventoryRequestsView(page, size, search, status),
  });

  const requests = returnRequests?.content ?? [];

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 70,
      render: (_, __, index) => page * size + index + 1,
    },
    {
      title: "User",
      dataIndex: ["user", "name"],
      key: "userName",
    },
    {
      title: "Material Code",
      dataIndex: ["material", "materialCode"],
      key: "materialCode",
    },
    {
      title: "Material Name",
      dataIndex: ["material", "materialName"],
      key: "materialName",
    },
    {
      title: "Requested Quantity",
      dataIndex: "requestQuantity",
      key: "requestQuantity",
      render: (_, record) =>
        `${record.requestQuantity ?? 0} ${record.material.unit ?? "-"}`,
    },
    {
      title: "Status",
      dataIndex: "requestStatus",
      key: "requestStatus",
      align: "center",
      render: (status, record) => (
        <Tag
          className={`${styles.statusTag} ${
            status === "APPROVED" ? styles.approved : styles.rejected
          }`}
          title={status}
          onClick={() => {
            setSelectedRequest(record);
            setViewModalOpen(true);
          }}
        >
          {status === "APPROVED" ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          )}
        </Tag>
      ),
    },
    {
      title: "Requested At",
      dataIndex: "requestedAt",
      key: "requestedAt",
      align: "center",
      render: (date) => <DateFormatter date={date} />,
    },
  ];

  return (
    <div>
      <DataTable
        title="Processed Requests"
        columns={columns}
        dataSource={requests}
        loading={isLoading}
        showFullScreen
        showSearch
        searchPlaceholder="Search by material code or name..."
        onSearch={(value) => {
          setSearch(value);
          setPage(0);
        }}
        filterOptions={[
          {
            label: "All",
            key: "ALL",
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
        pagination={{
          page,
          size,
          total: returnRequests?.totalElements ?? 0,
          setPage,
          setSize,
        }}
        tableHeight={350}
      />
      <Modal
        title={
          selectedRequest?.requestStatus === "APPROVED"
            ? "Approval Details"
            : "Rejection Details"
        }
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedRequest(null);
        }}
        footer={null}
      >
        {selectedRequest &&
          (selectedRequest?.requestStatus === "APPROVED" ? (
            <>
              <p>
                <strong>Approved Quantity: </strong>
                {selectedRequest.approvedQuantity}
              </p>
              <p>
                <strong>Approval Remarks: </strong>

                {selectedRequest.approvalRemarks || "-"}
              </p>
              <p>
                <strong>Approved At: </strong>
                {selectedRequest.approvedAt ? (
                  <DateFormatter date={selectedRequest.approvedAt} />
                ) : (
                  "-"
                )}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Rejection Remarks : </strong>
                {selectedRequest.rejectionRemarks || "-"}
              </p>
              <p>
                <strong>Rejected At : </strong>
                {selectedRequest.rejectedAt ? (
                  <DateFormatter date={selectedRequest.rejectedAt} />
                ) : (
                  "-"
                )}
              </p>
            </>
          ))}
      </Modal>
    </div>
  );
};

export default ViewRequests;
