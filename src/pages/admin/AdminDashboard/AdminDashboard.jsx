import { Button, message } from "antd";
import styles from "./AdminDashboard.module.css";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardSummary } from "../../../utils/dashboard";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import StatsCards from "../../../components/StatCard/StatsCards";
import ChartCard from "../../../components/ChartCard/ChartCard";
import RequestStatus from "../../../components/DashboardCharts/RequestStatus/RequestStatus";
import MaterialOrder from "../../../components/MaterialOrder/MaterialOrder";
import PageHeader from "../../../components/PageHeader/PageHeader";
import ProductTrend from "../../../components/DashboardCharts/ProductTrend/ProductTrend";

const AdminDashboard = () => {
  const [materialOrder, setMaterialOrder] = useState(false);
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getAdminDashboardSummary,
    // refetchInterval: 30000,
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
  const stats = [
    {
      key: "total-products",
      title: "Total Products",
      value: dashboard?.totalProducts ?? 0,
      color: "var(--second-color)",
      hoverColor: "var(--second-color-dk)",
    },
    {
      key: "low-stock",
      title: "Low Stock Product(s)",
      value: dashboard?.lowStock ?? 0,
      color: "var(--third-color)",
      hoverColor: "var(--third-color-dk)",
    },
    {
      key: "out-of-stock",
      title: "Out of Stock Product(s)",
      value: dashboard?.outOfStock ?? 0,
      color: "var(--fourth-color)",
      hoverColor: "var(--fourth-color-dk)",
    },
    {
      key: "highest-stock",
      title: "Over Stocked Product(s)",
      value: dashboard?.mostStock ?? 0,
      color: "var(--first-color)",
      hoverColor: "var(--first-color-dk)",
    },
  ];

  const charts = [
    {
      key: "Product-trend",
      xs: 24,
      sm: 24,
      lg: 16,
      component: <ProductTrend />,
    },
    {
      key: "request-status",
      xs: 24,
      sm: 24,
      lg: 8,
      component: <RequestStatus />,
    },
  ];

  const action = (
    <Button
      type="primary"
      onClick={() => setMaterialOrder(true)}
      loading={isLoading}
      disabled={isLoading}
      className={styles.orderBtn}
    >
      <PlusOutlined /> Order
    </Button>
  );

  return (
    <div className={styles.container}>
      <PageHeader
        title="Admin Dashboard"
        description="Manage your inventory here"
        action={action}
      />

      <div className={styles.content}>
        <StatsCards gutter={[16, 16]} items={stats} loading={isLoading} />

        <ChartCard gutter={[16, 16]} items={charts} />
      </div>
      {materialOrder && (
        <MaterialOrder
          materialOrder={materialOrder}
          setMaterialOrder={setMaterialOrder}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
