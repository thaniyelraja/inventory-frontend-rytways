import styles from "./Dashboard.module.css";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getUser } from "../../utils/auth";
import { getDashboardSummary } from "../../utils/dashboard";

import RequestTrend from "../../components/DashboardCharts/ProductTrend/ProductTrend";
import RequestStatus from "../../components/DashboardCharts/MonthlyTopTrend/MonthlyTopTrend";
import StatsCards from "../../components/StatCard/StatsCards";
import PageHeader from "../../components/PageHeader/PageHeader";
import ChartCard from "../../components/ChartCard/ChartCard";
import InventoryRequestModal from "../../components/InventoryRequestModal/InventoryRequestModal";

function Dashboard() {
  const user = useMemo(() => {
    return getUser();
  }, []);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard-summary", user?.id],
    queryFn: () => getDashboardSummary(user?.id),
    enabled: !!user?.id,
  });

  const stats = [
    {
      key: "materials",
      title: "Total Products",
      value: dashboard?.totalMaterials ?? 0,
    },
    {
      key: "pending",
      title: "Pending Requests",
      value: dashboard?.pendingRequests ?? 0,
    },
    {
      key: "approved",
      title: "Approved Requests",
      value: dashboard?.approvedRequests ?? 0,
    },
    {
      key: "rejected",
      title: "Rejected Requests",
      value: dashboard?.rejectedRequests ?? 0,
    },
  ];

  const charts = [
    {
      key: "request-trend",
      xs: 24,
      lg: 17,
      component: <RequestTrend userId={user.id} />,
    },
    {
      key: "request-status",
      xs: 24,
      lg: 7,
      component: <RequestStatus userId={user.id} />,
    },
  ];

  return (
    <>
      <div className={styles.dashboard}>
        <PageHeader
          title={`Good Morning, ${user?.name}`}
          description="Here's what's happening with you requests"
        />

        <StatsCards items={stats} gutter={[16, 16]} loading={isLoading} />

        <ChartCard items={charts} gutter={[16, 16]} />
      </div>
      <InventoryRequestModal />
    </>
  );
}

export default Dashboard;
