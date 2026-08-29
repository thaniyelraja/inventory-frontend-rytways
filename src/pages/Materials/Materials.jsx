import styles from "./Materials.module.css";
import {
  Button,
  Card,
  InputNumber,
  Popover,
  Tag,
  Form,
  message,
  Select,
} from "antd";
import DataTable from "../../components/DataTable/DataTable";
import { MoreOutlined } from "@ant-design/icons";
import { FaRegHandPointer } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import {
  exportMaterialsExcel,
  getCategories,
  getMaterials,
  getRequestDetails,
} from "../../utils/material";
import { useEffect, useState } from "react";
import { createInventoryRequests } from "../../utils/inventoryRequest";
import { getUser } from "../../utils/auth";
import AppModal from "../../components/AppModal/AppModal";
import { useInventoryRequest } from "../../context/useInventoryRequest";
import SingleRequestModal from "../../components/SingleRequestModal/SingleRequestModal";

const Materials = () => {
  const [form] = Form.useForm();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { requestSingleOpen, setRequestSingleOpen } = useInventoryRequest();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [categoryId, setCategoryId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [placeRequestOpen, setPlaceRequestOpen] = useState(false);

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
  const selectedMaterials = materials.filter((material) =>
    selectedRowKeys.includes(material.materialId),
  );

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
                if (record.availableQuantity === 0) {
                  message.warning("Product out of Stock");
                  setOpenPopoverId(null);
                  return;
                }
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

  const handleBtnSubmit = async (values) => {
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
        quantity: values.quantities[material.materialId],
      })),
    };

    try {
      await createInventoryRequests(requestData);

      message.success("Inventory request submitted", 1.5);

      setSelectedRowKeys([]);
      setPlaceRequestOpen(false);
      form.resetFields();
    } catch (error) {
      console.log(error);
      message.error("Failed to submit request", 1.5);
    }
  };

  const handleRequest = (material) => {
    setSelectedMaterial(material);
    form.resetFields();
    setRequestSingleOpen(true);
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
            getCheckboxProps: (record) => ({
              disabled: record.availableQuantity === 0,
            }),
            getTitleCheckboxProps: () => ({
              style: {
                display: "none",
              },
            }),
          }}
          showPagination
          showSelectionBtn
          onSelectionBtn={() => setPlaceRequestOpen(true)}
          selectionBtnText="Place request"
          selectionBtnIcon={<FaRegHandPointer />}
          onClearSelection={() => setSelectedRowKeys([])}
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
      <AppModal
        title="Inventory Request List"
        open={placeRequestOpen}
        onClose={() => setPlaceRequestOpen(false)}
        width={600}
        showFooter
        footer={
          <Button type="primary" onClick={() => form.submit()}>
            Place Request
          </Button>
        }
      >
        <Form form={form} onFinish={handleBtnSubmit}>
          <div className={styles.requestList}>
            {selectedMaterials.map((material) => (
              <div key={material.materialId} className={styles.requestItem}>
                <div className={styles.materialInfo}>
                  <span>
                    Material Name : <strong>{material.materialName}</strong>
                  </span>

                  <span>
                    Available :{" "}
                    <strong>
                      {material.availableQuantity}
                      {material.unit}
                    </strong>
                  </span>
                </div>

                <div className={styles.quantity}>
                  <span>Request Quantity: </span>

                  <Form.Item
                    name={["quantities", material.materialId]}
                    initialValue={1}
                    noStyle
                  >
                    <InputNumber
                      min={1}
                      defaultValue={1}
                      max={material.availableQuantity}
                    />
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>
        </Form>
      </AppModal>
      <SingleRequestModal
        requestSingleOpen={requestSingleOpen}
        setRequestSingleOpen={setRequestSingleOpen}
        material={selectedMaterial}
        user={user}
        mode="create"
      />
      <AppModal
        title="View Material"
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
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
      </AppModal>
    </div>
  );
};

export default Materials;
