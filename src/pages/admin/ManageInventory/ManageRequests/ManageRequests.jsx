import styles from "./ManageRequests.module.css";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popover,
  Tag,
} from "antd";
import { ClockCircleOutlined, MoreOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../../../components/DataTable/DataTable";
import {
  getInventoryRequestsManage,
  manageInventoryRequest,
} from "../../../../utils/inventoryRequest";
import DateFormatter from "../../../../components/DateFormatter/DateFormatter";

const ManageRequests = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [actionOpen, setActionOpen] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const {
    data: returnRequests,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-manage-requests", page, size, search],
    queryFn: () => getInventoryRequestsManage(page, size, search),
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
        `${record?.requestQuantity ?? 0} ${record.material?.unit ?? ""}`,
    },
    {
      title: "Available Quantity",
      key: "availableQuantity",
      render: (_, record) =>
        `${record.material?.availableQuantity ?? 0} ${record.material?.unit ?? ""}`,
    },
    {
      title: "Status",
      dataIndex: "requestStatus",
      key: "requestStatus",
      align: "center",
      render: (status) => (
        <Tag className={styles.statusTag} title={status}>
          {status === "PENDING" && <ClockCircleOutlined />}
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const content = (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button
              type="text"
              onClick={() => {
                console.log(record);
                setSelectedRequest(record);
                setActionType("APPROVED");
                setActionOpen(null);
                form.resetFields();
              }}
            >
              Approve
            </Button>

            <Button
              type="text"
              danger
              onClick={() => {
                setSelectedRequest(record);
                setActionType("REJECTED");
                setActionOpen(null);
                form.resetFields();
              }}
            >
              Reject
            </Button>
          </div>
        );

        return (
          <Popover
            content={content}
            trigger="click"
            open={actionOpen === record.inventoryRequestId}
            onOpenChange={(open) => {
              setActionOpen(open ? record.inventoryRequestId : null);
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Popover>
        );
      },
    },
  ];

  const handleRequestAction = async (values) => {
    const requestData =
      actionType === "APPROVED"
        ? {
            approvedQuantity: values.approvedQuantity,
            approvalRemarks: values.remarks,
          }
        : {
            rejectionRemarks: values.remarks,
          };

    try {
      await manageInventoryRequest(
        selectedRequest.inventoryRequestId,
        actionType,
        requestData,
      );

      message.success(
        actionType === "APPROVED"
          ? "Request approved successfully"
          : "Request rejected successfully",
        1.5,
      );

      setSelectedRequest(null);
      form.resetFields();
      await refetch();
    } catch (error) {
      console.log(error);
      message.error("Failed to update request", 1.5);
    }
  };

  return (
    <div className={styles.container}>
      <DataTable
        title="Manage Requests"
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
        showPagination
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
        title={actionType === "APPROVED" ? "Approve Request" : "Reject Request"}
        open={!!selectedRequest}
        onCancel={() => {
          setSelectedRequest(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={actionType === "APPROVED" ? "Approve" : "Reject"}
        okButtonProps={{
          danger: actionType === "REJECTED",
        }}
      >
        {actionType === "APPROVED" && selectedRequest && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>Requested Quantity: </strong>
              {selectedRequest.requestQuantity}
            </p>

            <p>
              <strong>Available Quantity: </strong>
              {selectedRequest.material.availableQuantity}
            </p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleRequestAction(values);
          }}
        >
          {actionType === "APPROVED" && (
            <Form.Item
              label="Approved Quantity"
              name="approvedQuantity"
              rules={[
                {
                  required: true,
                  message: "Please enter approved quantity",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Quantity must be at least 1",
                },
                {
                  validator: (_, value) => {
                    const maxQuantity = Math.min(
                      selectedRequest?.requestQuantity ?? 0,
                      selectedRequest?.material?.availableQuantity ?? 0,
                    );

                    if (value > maxQuantity) {
                      return Promise.reject(
                        new Error(
                          `Approved quantity cannot exceed ${maxQuantity}`,
                        ),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Enter approval quantity"
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Remarks"
            name="remarks"
            rules={[
              {
                required: true,
                message: "Please enter remarks",
              },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter remarks" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageRequests;
