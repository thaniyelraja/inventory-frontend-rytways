import { PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Form, InputNumber, message, Modal, Select } from "antd";
import { useState } from "react";
import {
  getCategoriesBySupplierId,
  getMaterialsByCategory,
  getSuppliers,
  placeOrder,
} from "../../utils/material";
import styles from "./MaterialOrder.module.css";
import MaterialOrderCart from "../MaterialOrderCart/MaterialOrderCart";
import { getUser } from "../../utils/auth";

const MaterialOrder = ({ materialOrder, setMaterialOrder }) => {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const supplierId = Form.useWatch("supplierId", form);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", supplierId],
    queryFn: () => getCategoriesBySupplierId(supplierId),
    enabled: !!supplierId,
  });

  const categoryId = Form.useWatch("categoryId", form);

  const { data: materialsByCat = [] } = useQuery({
    queryKey: ["materials", supplierId, categoryId],
    queryFn: () => getMaterialsByCategory(supplierId, categoryId),
    enabled: !!supplierId && !!categoryId,
  });

  const handleAddMaterial = async () => {
    const values = await form.validateFields();

    const supplier = suppliers.find(
      (item) => item.supplierId === values.supplierId,
    );

    const category = categories.find(
      (item) => item.categoryId === values.categoryId,
    );

    const material = materialsByCat.find(
      (item) => item.materialId === values.materialId,
    );

    if (!supplier || !category || !material) {
      message.error("Invalid supplier, category or material");
      return;
    }

    const existingMaterial = materials.find(
      (item) =>
        item.supplierId === values.supplierId &&
        item.materialId === values.materialId,
    );

    if (existingMaterial) {
      setMaterials((prev) =>
        prev.map((item) =>
          item.supplierId === values.supplierId &&
          item.materialId === values.materialId
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

    const newMaterial = {
      supplierId: values.supplierId,
      supplierName: supplier.supplierName,
      categoryId: values.categoryId,
      categoryName: category.categoryName,
      materialId: values.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName,
      quantity: values.quantity,
      price: material.price,
    };

    setMaterials((prev) => {
      let lastCategoryIndex = -1;

      prev.forEach((item, index) => {
        if (
          item.supplierId === values.supplierId &&
          item.categoryId === values.categoryId
        ) {
          lastCategoryIndex = index;
        }
      });

      if (lastCategoryIndex === -1) {
        return [...prev, newMaterial];
      }

      const updated = [...prev];

      updated.splice(lastCategoryIndex + 1, 0, newMaterial);

      return updated;
    });

    form.resetFields(["materialId", "quantity"]);
  };

  const user = getUser();

  const handlePlaceOrder = async () => {
    if (materials.length === 0) {
      message.warning("Add atleast one material");
      return;
    }

    const supplierOrders = Object.values(
      materials.reduce((groups, item) => {
        if (!groups[item.supplierId]) {
          groups[item.supplierId] = {
            supplierId: item.supplierId,
            createdBy: user.id,
            items: [],
            totalAmount: 0,
          };
        }

        groups[item.supplierId].items.push({
          materialId: item.materialId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
        });

        groups[item.supplierId].totalAmount += item.price * item.quantity;

        return groups;
      }, {}),
    );

    console.log(supplierOrders);

    try {
      await placeOrder(supplierOrders);
      message.success("Order placed successfully");
      setMaterials([]);
      setCartOpen(false);
      setMaterialOrder(false);
    } catch (error) {
      message.error("Failed to place order");
      console.error(error);
    }
  };

  return (
    <>
      <Modal
        open={materialOrder}
        onCancel={() => setMaterialOrder(false)}
        title={
          <div className={styles.modalTitle}>
            <span>Order Materials</span>

            <Badge count={materials.length} className={styles.cartBadge}>
              <Button
                type="text"
                className={styles.cartBtn}
                icon={<ShoppingCartOutlined />}
                onClick={() => setCartOpen(true)}
              />
            </Badge>
          </div>
        }
        footer={null}
        centered
        width={700}
      >
        <Form form={form} layout="horizontal" onFinish="">
          <Form.Item
            label="Supplier"
            name="supplierId"
            rules={[
              {
                required: true,
                message: "Please select supplied",
              },
            ]}
          >
            <Select
              placeholder="Select Supplier"
              options={suppliers.map((supplier) => ({
                value: supplier.supplierId,
                label: `${supplier.supplierCode} - ${supplier.supplierName}`,
              }))}
              onChange={() => {
                form.resetFields(["categoryId", "materialId", "quantity"]);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[
              {
                required: true,
                message: "please select a category",
              },
            ]}
          >
            <Select
              placeholder="Select category"
              options={categories.map((category) => ({
                value: category.categoryId,
                label: category.categoryName,
              }))}
              disabled={!supplierId}
              onChange={() => {
                form.resetFields(["materialId", "quantity"]);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Material"
            name="materialId"
            rules={[
              {
                required: true,
                message: "Select a material",
              },
            ]}
          >
            <Select
              placeholder="Select material"
              options={materialsByCat.map((material) => ({
                value: material.materialId,
                label: `${material.materialCode} - ${material.materialName}`,
              }))}
              disabled={!categoryId}
            />
          </Form.Item>

          <div className={styles.actions}>
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                {
                  required: true,
                  message: "Please enter quantity",
                },
              ]}
            >
              <InputNumber min={1} placeholder="Enter quantity" />
            </Form.Item>
          </div>

          <div className={styles.actionBtns}>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={handleAddMaterial}
            >
              Add material
            </Button>
          </div>
        </Form>
      </Modal>

      <MaterialOrderCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        materials={materials}
        setMaterials={setMaterials}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  );
};

export default MaterialOrder;
