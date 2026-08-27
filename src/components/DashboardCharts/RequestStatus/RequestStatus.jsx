import { useQuery } from "@tanstack/react-query";
import DonutChart from "../../DonutChart/DonutChart";
import { getRequestStatus } from "../../../utils/dashboard";

const RequestStatus = ({ userId }) => {
  const { data = [] } = useQuery({
    queryKey: ["request-status", userId],
    queryFn: () => getRequestStatus(userId),
    enabled: false,
  });

  const dataMap = {
    PENDING: {
      name: "Pending",
      color: "var(--second-color)",
    },
    APPROVED: {
      name: "Approved",
      color: "var(--first-color)",
    },
    REJECTED: {
      name: "Rejected",
      color: "var(--fourth-color)",
    },
  };

  const chartData = data.map((item) => ({
    name: dataMap[item.status].name ?? item.status,
    value: item.count,
    color: dataMap[item.status]?.color,
  }));

  return (
    <DonutChart
      data={chartData}
      title="Request Status"
      subtitle="Your request overview"
    />
  );
};

export default RequestStatus;
