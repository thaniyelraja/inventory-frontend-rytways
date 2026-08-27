import styles from "./ManageMaterials.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaterial,
  deleteMaterial,
  getCategories,
  getMaterials,
  updateMaterial,
} from "../../../utils/material";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import DataTable from "../../../components/DataTable/DataTable";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Steps,
  message,
} from "antd";
import { ArrowLeftOutlined, MoreOutlined } from "@ant-design/icons";

const ManageMaterials = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { mutate: saveMaterial, isPending: isSaving } = useMutation({
    mutationFn: ({ materialId, values }) => {
      if (materialId) {
        return updateMaterial(materialId, values);
      }
      return createMaterial(values);
    },

    onSuccess: () => {
      toast.success(
        editingMaterial
          ? "Material updated successfully"
          : "Material added successfully",
      );
      setAddModalOpen(false);
      setEditingMaterial(null);
      form.resetFields();
      setCurrentStep(0);

      queryClient.invalidateQueries({
        queryKey: ["manage-materials"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to save material",
        1.5,
      );
    },
  });

  const { mutate: removeMaterial, inPending: isDeleting } = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      toast.success("Material deleted successfully");
      setOpenPopoverId(null);
      queryClient.invalidateQueries({
        queryKey: ["manage-materials"],
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to delete material",
      );
    },
  });

  const {
    data: returnMaterials,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["manage-materials", page, size, search, status, categoryId],
    queryFn: () => getMaterials(page, size, search, status, categoryId),
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

  const filterContent = (
    <div className={styles.filterContent}>
      <Select
        placeholder="Select category"
        allowClear
        style={{ width: 180 }}
        options={[
          ...categories.map((category) => ({
            value: category.categoryId,
            label: category.categoryName,
          })),
        ]}
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
      title: "Price",
      dataIndex: "materialPrice",
      key: "materialPrice",
    },
    {
      title: "Max stock level",
      dataIndex: "maxStockLevel",
      key: "maxStockLevel",
    },
    {
      title: "Reorder level",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const content = (
          <div className={styles.popoverMenu}>
            <Button
              type="text"
              onClick={() => {
                setEditingMaterial(record);
                setCurrentStep(0);
                form.setFieldsValue({
                  ...record,
                  categoryId: record.category?.categoryId,
                });
                setOpenPopoverId(null);
                setAddModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              type="text"
              danger
              loading={isDeleting}
              onClick={() => {
                removeMaterial(record.materialId);
              }}
            >
              Delete
            </Button>
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

  const handleSubmit = (values) => {
    saveMaterial({ materialId: editingMaterial?.materialId, values });
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingMaterial(null);
    setCurrentStep(0);
    setAddModalOpen(true);
  };

  const handleAddCancel = () => {
    form.resetFields();
    setEditingMaterial(null);
    setCurrentStep(0);
    setAddModalOpen(false);
  };

  const handleNext = async () => {
    try {
      await form.validateFields([
        "materialCode",
        "materialName",
        "materialDesc",
        "categoryId",
        "unit",
      ]);
      setCurrentStep(1);
    } catch (error) {
      message.error(error);
      return;
    }
  };

  const materials = returnMaterials?.content ?? [];

  return (
    <div className={styles.container}>
      <DataTable
        title="Manage Materials"
        showFullScreen
        columns={columns}
        dataSource={materials}
        loading={isLoading}
        showSearch
        searchPlaceholder="Search materials..."
        onSearch={(value) => {
          setSearch(value);
          setPage(0);
        }}
        showFilter
        filterContent={filterContent}
        showAddBtn={true}
        onAdd={handleAdd}
        pagination={{
          page,
          size,
          total: returnMaterials?.totalElements ?? 0,
          setPage,
          setSize,
        }}
        showPagination
        tableHeight={350}
        rowKey="materialId"
      />

      <Modal
        title={editingMaterial ? "Edit Material" : "Add Material"}
        open={addModalOpen}
        onCancel={handleAddCancel}
        onOk={() => {
          if (currentStep === 0) {
            handleNext();
          } else {
            form.submit();
          }
        }}
        confirmLoading={isSaving}
        okText={currentStep === 0 ? "Next" : editingMaterial ? "Update" : "Add"}
        cancelText="Cancel"
        width={600}
        styles={{
          body: {
            paddingRight: 0,
          },
        }}
      >
        <div>
          <Steps
            current={currentStep}
            items={[
              {
                title: "Basic Details",
              },
              {
                title: "Stock & Pricing",
              },
            ]}
          />
        </div>
        <div
          style={{
            height: "350px",
            overflowY: "auto",
            paddingRight: "10px",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={true}
            style={{ marginTop: 10 }}
          >
            <div style={{ display: currentStep === 0 ? "block" : "none" }}>
              <Form.Item
                label="Material Code"
                name="materialCode"
                rules={[
                  {
                    required: true,
                    message: "Please enter material code",
                  },
                ]}
              >
                <Input placeholder="Enter material code. Ex: MAT-000" />
              </Form.Item>
              <Form.Item
                label="Material Name"
                name="materialName"
                rules={[
                  {
                    required: true,
                    message: "Please enter material name",
                  },
                ]}
              >
                <Input placeholder="Enter material name" />
              </Form.Item>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[
                  {
                    required: true,
                    message: "Please select unit",
                  },
                ]}
              >
                <Select
                  placeholder="Select unit"
                  options={[
                    { value: "NOS", label: "Nos" },
                    { value: "PCS", label: "Pieces (PCS)" },
                    { value: "KG", label: "Kilogram (KG)" },
                    { value: "G", label: "Gram (G)" },
                    { value: "L", label: "Litre (L)" },
                    { value: "ML", label: "Millilitre (ML)" },
                    { value: "M", label: "Metre (M)" },
                    { value: "CM", label: "Centimetre (CM)" },
                    { value: "BOX", label: "Box" },
                    { value: "PACK", label: "Pack" },
                    { value: "SET", label: "Set" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[
                  {
                    required: true,
                    message: "Please select category",
                  },
                ]}
              >
                <Select
                  placeholder="Select category"
                  options={categories.map((category) => ({
                    value: category.categoryId,
                    label: category.categoryName,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Material Description"
                name="materialDesc"
                rules={[
                  {
                    required: true,
                    message: "Please enter material description",
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter material description"
                />
              </Form.Item>{" "}
            </div>

            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              <Button onClick={() => setCurrentStep(0)}>
                <ArrowLeftOutlined />
              </Button>
              <Form.Item
                label="Material Price"
                name="materialPrice"
                rules={[
                  {
                    required: true,
                    message: "Please enter price",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Price cannot be negative",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter price"
                />
              </Form.Item>

              <Form.Item
                label="Maximum Stock Level"
                name="maxStockLevel"
                rules={[
                  {
                    required: true,
                    message: "Please enter maximum stock level",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Maximum stock level must be at least 1",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Enter maximum stock level"
                />
              </Form.Item>

              <Form.Item
                label="Reorder Level"
                name="reorderLevel"
                dependencies={["maxStockLevel"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter reorder level",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Reorder level cannot be negative",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const maxStockLevel = getFieldValue("maxStockLevel");

                      if (
                        value !== undefined &&
                        maxStockLevel !== undefined &&
                        value >= maxStockLevel
                      ) {
                        return Promise.reject(
                          new Error(
                            "Reorder level must be less than maximum stock level",
                          ),
                        );
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter reorder level"
                />
              </Form.Item>

              <Form.Item
                label="Available Quantity"
                name="availableQuantity"
                dependencies={["maxStockLevel"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter quantity",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Quantity cannot be zero or negative",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const maxStockLevel = getFieldValue("maxStockLevel");
                      if (
                        value !== undefined &&
                        maxStockLevel !== undefined &&
                        value > maxStockLevel
                      ) {
                        return Promise.reject(
                          new Error(
                            "Available quantity can't exceed maximu  stock level",
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ManageMaterials;
