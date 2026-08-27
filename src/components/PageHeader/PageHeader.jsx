import { Typography } from "antd";
import styles from "./PageHeader.module.css";

const { Title, Text } = Typography;

const PageHeader = ({ title, description, action }) => {
  return (
    <div className={styles.header}>
      <div>
        <Title level={2}>{title}</Title>
        <Text>{description}</Text>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
