import { useQuery } from "@tanstack/react-query";
import DonutChart from "../../DonutChart/DonutChart";
import { getMonthlyTopProducts } from "../../../utils/dashboard";
import { useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";

const MonthlyTopTrend = () => {
  const [date, setDate] = useState(dayjs());
  const month = date.month() + 1;
  const { data = [], isLoading } = useQuery({
    queryKey: ["monthly-top-products", month],
    queryFn: () => getMonthlyTopProducts(month),
    enabled: !!date,
  });

  const colors = [
    "var(--first-color)",
    "var(--second-color)",
    "var(--third-color)",
    "var(--fourth-color)",
    "var(--accent)",
  ];

  const chartData = data.map((item, index) => ({
    name: item.materialName,
    value: Number(item.totalQuantity),
    color: colors[index % colors.length],
  }));

  const picker = (
    <DatePicker
      value={date}
      onChange={setDate}
      picker="month"
      format="MMM YYYY"
    />
  );

  return (
    <DonutChart
      data={chartData}
      title="Monthly Top Trend"
      subtitle="Your request overview"
      loading={isLoading}
      picker={picker}
      emptyText="No orders"
    />
  );
};

export default MonthlyTopTrend;
