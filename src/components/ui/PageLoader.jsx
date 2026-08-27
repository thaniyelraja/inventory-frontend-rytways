import styles from "./PageLoader.module.css";
import { Spin } from "antd";

const PageLoader = () => {
  return (
    <div className={styles.loader}>
      <Spin size="large" />
    </div>
  );
};

export default PageLoader;
