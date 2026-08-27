import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./StatusTag.module.css";
import { Tag } from "antd";

const StatusTag = ({ status, onClick }) => {
  const config = {
    PENDING: {
      color: "var(--pending)",
      icon: <ClockCircleOutlined />,
    },
    APPROVED: {
      color: "var(--approved)",
      icon: <CheckCircleOutlined />,
    },
    REJECTED: {
      color: "var(--rejected)",
      icon: <CloseCircleOutlined />,
    },
  };

  const current = config[status];

  if (!current) return null;

  return (
    <Tag
      color={current.color}
      icon={current.icon}
      className={styles.tag}
      onClick={onClick}
    />
  );
};

export default StatusTag;
