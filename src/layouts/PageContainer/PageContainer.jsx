import styles from "./PageContainer.module.css";
const PageContainer = ({ children }) => {
  return <main className={styles.container}>{children}</main>;
};

export default PageContainer;
