import { Badge, Button, Form, InputNumber, message, Select } from "antd";
import styles from "./InventoryRequestModal.module.css";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getMaterialsByCategories } from "../../utils/material";
import { PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useState } from "react";
import InventoryRequestCart from "../InventoryRequestCart/InventoryRequestCart";
import { getUser } from "../../utils/auth";
import { createInventoryRequests } from "../../utils/inventoryRequest";
import { useInventoryRequest } from "../../context/useInventoryRequest";
import AppModal from "../AppModal/AppModal";

const InventoryRequestModal = ({ onSuccess }) => {
  const { request, setRequest } = useInventoryRequest();
  const user = getUser();
  const [form] = Form.useForm();
  const [requestItems, setRequestItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categoryId = Form.useWatch("categoryId", form);

  const { data: categoryItems = [] } = useQuery({
    queryKey: ["inventory-request-items", categoryId],
    queryFn: () => getMaterialsByCategories(categoryId),
    enabled: !!categoryId,
  });

  const handleAddMaterial = async () => {
    const values = await form.validateFields();

    const category = categories.find(
      (item) => item.categoryId === values.categoryId,
    );

    const material = categoryItems.find(
      (item) => item.materialId === values.materialId,
    );

    if (!category || !material) {
      message.error("Invalid category or material");
      return;
    }

    const existingItem = requestItems.find(
      (item) =>
        item.materialId === values.materialId &&
        item.categoryId === values.categoryId,
    );

    if (existingItem) {
      setRequestItems((prev) =>
        prev.map((item) =>
          item.materialId === values.materialId &&
          item.categoryId === values.categoryId
            ? {
                ...item,
                quantity: item.quantity + values.quantity,
              }
            : item,
        ),
      );
      form.resetFields(["materialId", "quantity"]);
      return;
    }
    const newItem = {
      categoryId: values.categoryId,
      categoryName: category.categoryName,
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName,
      price: material.price,
      quantity: values.quantity,
    };
    setRequestItems((prev) => [...prev, newItem]);
    form.resetFields(["materialId", "quantity"]);
  };

  const onSubmit = async () => {
    if (requestItems.length === 0) {
      message.warning("Add at lease one material");
      return;
    }

    const requestData = {
      userId: user.userId,
      items: requestItems.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
      })),
    };
    try {
      await createInventoryRequests(requestData);
      message.success("Inventory request submitter", 1.5);
      setRequestItems([]);
      setCartOpen(false);
      setRequest(false);
      await onSuccess();
    } catch (error) {
      console.log(error);
      message.error("Failed to submit", 1.5);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setRequest(false);
  };
  return (
    <div className={styles.container}>
      <AppModal
        open={request}
        onClose={handleClose}
        centered
        width={600}
        title={
          <div className={styles.modalTitle}>
            <span>Inventory Request</span>
            <Badge count={requestItems.length} className={styles.cartBadge}>
              <Button
                type="text"
                className={styles.cartBtn}
                icon={<UnorderedListOutlined />}
                onClick={() => setCartOpen(true)}
              />
            </Badge>
          </div>
        }
      >
        <Form form={form} layout="horizontal">
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[
              {
                required: true,
                message: "Please select a category",
              },
            ]}
          >
            <Select
              placeholder="Select category"
              options={categories.map((category) => ({
                value: category.categoryId,
                label: category.categoryName,
              }))}
              onChange={() => {
                form.resetFields(["materialId", "quantity"]);
              }}
            ></Select>
          </Form.Item>
          <Form.Item
            label="Material"
            name="materialId"
            rules={[
              {
                required: true,
                message: "Please select an item",
              },
            ]}
          >
            <Select
              placeholder="Select item"
              disabled={!categoryId}
              options={categoryItems.map((item) => ({
                value: item.materialId,
                label: `${item.materialCode} - ${item.materialName}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Quantity"
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
            ]}
          >
            <InputNumber
              min={1}
              placeholder="Enter quantity"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Button type="default" onClick={handleAddMaterial}>
            <PlusOutlined /> Add to List
          </Button>
        </Form>
      </AppModal>
      <InventoryRequestCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        requestItems={requestItems}
        setRequestItems={setRequestItems}
        onSubmitRequest={onSubmit}
      />
    </div>
  );
};

export default InventoryRequestModal;
