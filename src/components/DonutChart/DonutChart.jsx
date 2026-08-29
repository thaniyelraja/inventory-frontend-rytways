import styles from "./DonutChart.module.css";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DonutChart = ({ data, title, subtitle, picker, emptyText }) => {
  const isEmpty = !data || data.length === 0;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>
        {picker && <div>{picker}</div>}
      </div>
      {isEmpty ? (
        <div className={styles.emptyState}>{emptyText || "No Data"}</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DonutChart;
