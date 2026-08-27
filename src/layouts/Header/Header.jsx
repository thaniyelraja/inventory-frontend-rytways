import styles from "./Header.module.css";
import { Avatar, Dropdown, Menu } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getUser, logout } from "../../utils/auth";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useState } from "react";
import ProfileModal from "../../components/ProfileModal/ProfileModal";

const Header = () => {
  const user = getUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const profileItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const adminMenuItems = [
    {
      key: "/admin/dashboard",
      label: "Admin Dashboard",
      icon: <BarChartOutlined />,
    },
    {
      key: "/admin/materials",
      label: "Manage Materials",
      icon: <AppstoreOutlined />,
    },
    {
      key: "/admin/manage-requests",
      label: "Manage Requests",
      icon: <FileDoneOutlined />,
    },
    {
      key: "/admin/view-requests",
      label: "View Requests",
      icon: <FileSearchOutlined />,
    },
    {
      key: "/admin/users",
      label: "Manage Users",
      icon: <TeamOutlined />,
    },
    {
      key: "/admin/orders",
      label: "Orders",
      icon: <ShoppingCartOutlined />,
    },
  ];

  const menuItems = [
    {
      key: "/dashboard",
      label: "Dashboard",
      icon: <HomeOutlined />,
    },
    {
      key: "/material",
      label: "Materials",
      icon: <ToolOutlined />,
    },
    {
      key: "/inventory-requests",
      label: "My Requests",
      icon: <SendOutlined />,
    },
  ];

  const items = user?.role === "ADMIN" ? [...adminMenuItems] : menuItems;

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleProfileClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    if (key === "profile") {
      setProfileOpen(true);
      return;
    }
  };
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} alt="Inventory System" />
        <span>Inventory Request System</span>
      </div>
      <div className={styles.rightSection}>
        <Dropdown
          popupRender={() => (
            <Menu
              items={items}
              selectedKeys={[location.pathname]}
              onClick={handleMenuClick}
            />
          )}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className={styles.menuBtn}>
            <MenuOutlined />
          </button>
        </Dropdown>
        <Dropdown
          menu={{
            items: profileItems,
            onClick: handleProfileClick,
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar className={styles.avatar} icon={<UserOutlined />} />
        </Dropdown>
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
    </header>
  );
};

export default Header;
