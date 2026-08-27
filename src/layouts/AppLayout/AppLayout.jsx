import styles from "./AppLayout.module.css";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";

import PageContainer from "../PageContainer/PageContainer";
const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
    </div>
  );
};

export default AppLayout;
