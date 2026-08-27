import { Card, Col, Row, Statistic } from "antd";
import styles from "./StatsCards.module.css";

const StatsCards = ({
  items,
  gutter,
  loading = false,
  xs = 24,
  sm = 12,
  lg = 6,
}) => {
  return (
    <Row gutter={gutter} className={styles.row}>
      {items.map((item) => (
        <Col key={item.key} xs={xs} sm={sm} lg={lg}>
          <Card className={styles.card} style={{ "--color": item.color, "--color-hover": item.hoverColor }}>
            <Statistic
              className={styles.statistic}
              title={item.title}
              value={item.value}
              loading={loading}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
