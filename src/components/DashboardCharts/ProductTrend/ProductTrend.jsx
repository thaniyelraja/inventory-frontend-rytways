import { useQuery } from "@tanstack/react-query";
import LineChart from "../../LineChart/LineChart";
import { getProductTrend } from "../../../utils/dashboard";
import { useState } from "react";
import { DatePicker } from "antd";
import styles from "./ProductTrend.module.css";
import dayjs from "dayjs";

const ProductTrend = () => {
  const [date, setDate] = useState(dayjs());
  const [hoverDate, setHoverDate] = useState(null);

  const queryValue = date
    ? {
        startDate: date.format("YYYY-MM-DD"),
      }
    : null;

  const { data = [], isLoading } = useQuery({
    queryKey: ["product-trend", queryValue],
    queryFn: () => getProductTrend("WEEKLY", queryValue),
    enabled: !!queryValue,
    // refetchInterval: 30000,
  });

  const chartData = data.map((item) => ({
    periodName: item.periodName,
    ...item.products,
  }));

  const products = [
    ...new Set(data.flatMap((item) => Object.keys(item.products || {}))),
  ];

  const lines = products.map((product, index) => ({
    dataKey: product,
    color: ["var(--second-color)", "var(--third-color)", "var(--fourth-color)"][
      index
    ],
  }));

  const cellRender = (current, info) => {
    const start = hoverDate;

    const isInRange =
      start &&
      !current.isBefore(start, "day") &&
      current.isBefore(start.add(7, "day"), "day");

    return (
      <div
        onMouseEnter={() => setHoverDate(current)}
        style={{
          background: isInRange ? "var(--third-color)" : "transparent",
          color: isInRange ? "#fff" : "inherit",
          height: "100%",
        }}
      >
        {info.originNode}
      </div>
    );
  };

  const pickers = (
    <DatePicker
      className={styles.picker}
      value={date}
      onChange={setDate}
      picker="date"
      format="DD MMM YYYY"
      cellRender={cellRender}
    />
  );

  return (
    <div>
      <LineChart
        data={chartData}
        loading={isLoading}
        xKey="periodName"
        title="Product Trend"
        subtitle="Product request activity"
        lines={lines}
        extra={pickers}
      />
    </div>
  );
};

export default ProductTrend;
