import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Legend,
} from "recharts";
import styles from "./LineChart.module.css";

const LineChart = ({ data, xKey, lines, title, subtitle, picker }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>
        {picker && <div className={styles.actions}>{picker}</div>}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active) return null;

              return (
                <div className={styles.tooltip}>
                  <strong>{label}</strong>

                  {payload?.length ? (
                    payload.map((item) => (
                      <div key={item.dataKey}>
                        {item.dataKey === "noOrders"
                          ? "No orders"
                          : `${item.dataKey}: ${item.value}`}
                      </div>
                    ))
                  ) : (
                    <div>No Orders</div>
                  )}
                </div>
              );
            }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
          <Line
            dataKey="noOrders"
            stroke="transparent"
            dot={false}
            activeDot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
