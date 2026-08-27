import { Card, Col, Row } from "antd";
import styles from "./ChartCard.module.css";

const ChartCard = ({ items, gutter }) => {
  return (
    <Row gutter={gutter} className={styles.row}>
      {items.map((item) => (
        <Col key={item.key} xs={item.xs} sm={item.sm} lg={item.lg}>
          <Card className={styles.card}>{item.component}</Card>
        </Col>
      ))}
    </Row>
  );
};

export default ChartCard;
