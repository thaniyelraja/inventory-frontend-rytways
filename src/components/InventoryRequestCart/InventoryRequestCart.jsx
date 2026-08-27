import { Button, Drawer, InputNumber } from "antd";
import styles from "./InventoryRequestCart.module.css";
import DataTable from "../DataTable/DataTable";
import { DeleteOutlined } from "@ant-design/icons";

const InventoryRequestCart = ({
  open,
  onClose,
  requestItems,
  setRequestItems,
  onSubmitRequest,
}) => {
  const tableItems = [...requestItems].sort((a, b) => {
    if (a.categoryId !== b.categoryId) {
      return a.categoryId - b.categoryId;
    }
    return a.materialName.localeCompare(b.materialName);
  });

  const totalAmount = requestItems.reduce(
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
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (value, row, index) => {
        if (index > 0 && tableItems[index - 1].categoryId === row.categoryId) {
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => value ?? "-",
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
            setRequestItems((prev) =>
              prev.map((item) =>
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
      render: (_, row) => row.price * row.quantity,
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
            setRequestItems((prev) =>
              prev.filter((item) => item.materialId !== row.materialId),
            );
          }}
        />
      ),
    },
  ];
  return (
    <div>
      <Drawer
        title={`Inventory Request (${requestItems.length})`}
        open={open}
        onClose={onClose}
        placement="right"
        size={700}
        className={styles.cartDrawer}
      >
        <DataTable
          columns={columns}
          dataSource={tableItems}
          rowKey="materialId"
          showPagination
          tableHeight={200}
        />
        <div className={styles.cartFooter}>
          <div className={styles.totalAmount}>
            <span className={styles.totalLabel}>Total Amount:</span>
            <strong className={styles.totalValue}>₹{totalAmount}</strong>
          </div>
          <Button
            type="primary"
            className={styles.submitBtn}
            onClick={onSubmitRequest}
            disabled={requestItems.length === 0}
          >
            Submit Request
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default InventoryRequestCart;
