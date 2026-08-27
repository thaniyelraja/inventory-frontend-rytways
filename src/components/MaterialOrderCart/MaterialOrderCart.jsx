import { DeleteOutlined } from "@ant-design/icons";
import { Button, Drawer, InputNumber } from "antd";
import styles from "./MaterialOrderCart.module.css";
import DataTable from "../DataTable/DataTable";

const MaterialOrderCart = ({
  open,
  onClose,
  materials,
  setMaterials,
  onPlaceOrder,
}) => {
  const tableMaterials = [...materials].sort((a, b) => {
    if (a.supplierId !== b.supplierId) {
      return a.supplierId - b.supplierId;
    }
    return a.categoryName.localeCompare(b.categoryName);
  });

  const totalPrice = materials.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const columns = [
    {
      title: "S.No",
      key: "serialNo",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (value) => (
        <div className={styles.tableCell} title={value}>
          {value}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (value, row, index) => {
        if (
          index > 0 &&
          tableMaterials[index - 1].categoryId === row.categoryId &&
          tableMaterials[index - 1].supplierId === row.supplierId
        ) {
          return "";
        }
        return value;
      },
    },
    {
      title: "Material Code",
      dataIndex: "materialCode",
      key: "materialCode",
      render: (value) => (
        <div className={styles.tableCell} title={value}>
          {value}
        </div>
      ),
    },
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
      render: (value) => (
        <div className={styles.tableCell} title={value}>
          {value}
        </div>
      ),
    },
    {
      title: "Purchase Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `${value}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (value, row) => (
        <InputNumber
          className={styles.quantityInput}
          min={1}
          value={value}
          onChange={(newQuantity) => {
            setMaterials((prev) =>
              prev.map((item) =>
                item.supplierId === row.supplierId &&
                item.materialId === row.materialId
                  ? {
                      ...item,
                      quantity: newQuantity,
                    }
                  : item,
              ),
            );
          }}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      render: (_, row) => `${row.price * row.quantity}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setMaterials((prev) =>
              prev.filter(
                (item) =>
                  !(
                    item.supplierId === row.supplierId &&
                    item.materialId === row.materialId
                  ),
              ),
            );
          }}
        />
      ),
    },
  ];

  return (
    <Drawer
      title={`Cart (${materials.length})`}
      open={open}
      onClose={onClose}
      placement="right"
      size={700}
      className={styles.cartDrawer}
    >
      <DataTable
        columns={columns}
        dataSource={tableMaterials}
        rowKey={(record) => `${record.supplierId}-${record.materialId}`}
        showPagination
        tableHeight={300}
      />
      <div className={styles.cartFooter}>
        <div className={styles.totalAmount}>
          <span className={styles.totalLabel}>Total Amount:</span>
          <strong className={styles.totalValue}>₹{totalPrice}</strong>
        </div>
        <Button
          type="primary"
          className={styles.placeOrderBtn}
          onClick={onPlaceOrder}
          disabled={materials.length === 0}
        >
          Place Order
        </Button>
      </div>
    </Drawer>
  );
};

export default MaterialOrderCart;
