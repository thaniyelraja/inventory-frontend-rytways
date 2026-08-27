import styles from "./Materials.module.css";
import {
  Button,
  Card,
  InputNumber,
  Modal,
  Popover,
  Tag,
  Form,
  message,
  Select,
} from "antd";
import DataTable from "../../components/DataTable/DataTable";
import { MoreOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  exportMaterialsExcel,
  getCategories,
  getMaterials,
  getRequestDetails,
} from "../../utils/material";
import { useEffect, useState } from "react";
import {
  createInventoryRequest,
  createInventoryRequests,
} from "../../utils/inventoryRequest";
import { getUser } from "../../utils/auth";

const Materials = () => {
  const [form] = Form.useForm();

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [categoryId, setCategoryId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const user = getUser();

  const {
    data: returnMaterials,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["materials", page, size, search, status, categoryId],
    queryFn: () => getMaterials(page, size, search, status, categoryId),
  });

  const {
    data: requestDetails,
    isLoading: requestLoading,
    isError: requestError,
    error: requestErrorData,
  } = useQuery({
    queryKey: ["request-details", user?.userId, selectedMaterial?.materialId],
    queryFn: () => getRequestDetails(user.userId, selectedMaterial.materialId),
    enabled: viewModalOpen && !!user.userId && !!selectedMaterial?.materialId,
    retry: false,
  });

  const getErrorMessage = (error) => {
    if (!error?.response) {
      return "Unable to connect to the server. Please try again.";
    }

    const status = error.response.status;

    switch (status) {
      case 404:
        return "Resource not found";
      case 500:
        return "Internal server error";
      default:
        return error.response?.data.message || "Something went wrong.";
    }
  };

  useEffect(() => {
    if (isError) {
      message.error(getErrorMessage(error), 1.5);
    }
  }, [isError, error]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const materials = returnMaterials?.content ?? [];

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
      dataIndex: "materialCode",
      key: "materialCode",
    },
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Available Quantity",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const available = record.availableQuantity > 0;

        return <Tag>{available ? "Available" : "Out of Stock"}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const content = (
          <div className={styles.popoverMenu}>
            <div
              className={styles.popoverItem}
              onClick={() => {
                handleRequest(record);
                setOpenPopoverId(null);
              }}
            >
              Request
            </div>

            <div
              className={styles.popoverItem}
              onClick={() => {
                setSelectedMaterial(record);
                setViewModalOpen(true);
                setOpenPopoverId(null);
              }}
            >
              View
            </div>
          </div>
        );

        return (
          <Popover
            content={content}
            trigger="click"
            placement="bottomRight"
            open={openPopoverId === record.materialId}
            onOpenChange={(open) => {
              setOpenPopoverId(open ? record.materialId : null);
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Popover>
        );
      },
    },
  ];

  const filterContent = (
    <div className={styles.filterContent}>
      <Select
        placeholder="Select Category"
        allowClear
        style={{ width: 180 }}
        options={categories.map((category) => ({
          value: category.categoryId,
          label: category.categoryName,
        }))}
        onChange={(value) => {
          setCategoryId(value ?? null);
          setPage(0);
        }}
      />
      <Select
        placeholder="Select Availability"
        allowClear
        style={{ width: 180 }}
        options={[
          {
            value: "AVAILABLE",
            label: "Available",
          },
          {
            value: "OUT_OF_STOCK",
            label: "Out of Stock",
          },
        ]}
        onChange={(value) => {
          setStatus(value ?? null);
          setPage(0);
        }}
      />
    </div>
  );

  const handleBtnSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select at least one material");
      return;
    }
    const selectedMaterials = materials.filter((material) =>
      selectedRowKeys.includes(material.materialId),
    );
    const requestData = {
      userId: user.userId,
      items: selectedMaterials.map((material) => ({
        materialId: material.materialId,
        quantity: 1,
      })),
    };
    try {
      await createInventoryRequests(requestData);
      message.success("Inventory request submitted", 1.5);
      setSelectedRowKeys([]);
    } catch (error) {
      console.log(error);
      message.error("Failed to submit request", 1.5);
    }
  };

  const handleRequest = (material) => {
    setSelectedMaterial(material);
    form.resetFields();
    setRequestModalOpen(true);
  };

  return (
    <div>
      <Card>
        <DataTable
          title="Materials"
          columns={columns}
          dataSource={materials}
          loading={isLoading}
          searchPlaceholder="Search materials..."
          showRowSelection
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedKeys) => {
              setSelectedRowKeys(selectedKeys);
            },
          }}
          showPagination
          showBtn
          onSubmitBtn={handleBtnSubmit}
          btnText="Place request"
          pagination={{
            page,
            size,
            total: returnMaterials?.totalElements ?? 0,
            setPage,
            setSize,
          }}
          showFullScreen
          showSearch
          onSearch={(value) => {
            setSearch(value);
            setPage(0);
          }}
          showFilter
          filterContent={filterContent}
          onExport={exportMaterialsExcel}
          tableHeight={350}
          rowKey="materialId"
        />
      </Card>

      <Modal
        title="Request Material"
        open={requestModalOpen}
        onCancel={() => {
          setRequestModalOpen(false);
          form.resetFields();
        }}
        onOk={() => {
          form.submit();
        }}
        okText="Submit Request"
      >
        {selectedMaterial && (
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              const requestData = {
                requestQuantity: values.quantity,
                material: {
                  materialId: selectedMaterial.materialId,
                },
                user: {
                  userId: user.userId,
                },
              };

              try {
                await createInventoryRequest(requestData);
                setRequestModalOpen(false);
                form.resetFields();
                message.success("Request submitted successfully", 1.5);
              } catch (error) {
                message.error(error, 2);
              }
            }}
          >
            <p>
              <strong>Material : </strong>
              {selectedMaterial.materialName}
            </p>

            <p>
              <strong>Available : </strong>
              {selectedMaterial.availableQuantity}
            </p>

            <Form.Item
              label="Request Quantity"
              name="quantity"
              rules={[
                {
                  required: true,
                  message: "Please enter quantity",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Quantity must be at least 1",
                },
                {
                  validator: (_, value) => {
                    if (value && (value <= 0 || typeof value !== "number")) {
                      return Promise.reject(
                        new Error("Please enter valid quantity"),
                      );
                    }

                    if (value && value > selectedMaterial.availableQuantity) {
                      return Promise.reject(
                        new Error("Quantity cannot be higher than available"),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber min={1} placeholder="Enter Quantity" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="View Material"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        centered
      >
        {selectedMaterial && (
          <>
            <p>
              <strong>Material Code: </strong>
              {selectedMaterial.materialCode}
            </p>

            <p>
              <strong>Material Name: </strong>
              {selectedMaterial.materialName}
            </p>

            <p>
              <strong>Available Quantity: </strong>
              {selectedMaterial.availableQuantity}
            </p>

            <p>
              <strong>Unit: </strong>
              {selectedMaterial.unit}
            </p>

            <p>
              <strong>Status : </strong>
              {selectedMaterial.availableQuantity > 0
                ? "Available"
                : "Out of stock"}
            </p>

            {requestLoading ? (
              <p>Loading request details...</p>
            ) : requestError && requestErrorData?.response.status === 404 ? (
              <p>
                <strong>Request Status: </strong>
                No Request
              </p>
            ) : (
              <div>
                <strong>Request Details: </strong>

                {requestDetails?.length > 0 ? (
                  requestDetails.map((request) => (
                    <div
                      key={request.inventoryRequestId}
                      className={styles.requestDetails}
                    >
                      <strong>Requested at: </strong>{" "}
                      {new Date(request.requestedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <strong>Request Status: </strong> {request.requestStatus}
                    </div>
                  ))
                ) : (
                  <div>
                    <strong>Request Status: </strong>
                    No request
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Materials;
