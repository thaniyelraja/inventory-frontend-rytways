import styles from "./Header.module.css";
import { Avatar, Dropdown, Menu } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  DownOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  // MoonOutlined,
  SendOutlined,
  // SunOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getUser, logout } from "../../utils/auth";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useEffect, useState } from "react";
import ProfileModal from "../../components/ProfileModal/ProfileModal";

const Header = () => {
  const user = getUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  // const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // useEffect(() => {
  //   document.body.classList.toggle("dark-theme", darkMode);
  // }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowMenu(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
  ];

  const userMenuItems = [
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

  const headerMenuItems =
    user?.role === "ADMIN"
      ? [
          {
            key: "admin",
            label: (
              <span className={styles.adminMenuLabel}>
                ADMIN <DownOutlined />
              </span>
            ),
            children: adminMenuItems,
          },
          {
            key: "/contact",
            label: "CONTACT",
          },
          {
            key: "/admin/orders",
            label: "ORDERS",
          },
        ]
      : userMenuItems;

  const menuItems =
    user?.role === "ADMIN" ? [...adminMenuItems] : userMenuItems;

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
        {showMenu ? (
          <Menu
            mode="horizontal"
            items={headerMenuItems}
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            className={styles.headerMenu}
            overflowedIndicator={null}
            triggerSubMenuAction="hover"
            subMenuOpenDelay={0}
            subMenuCloseDelay={0.2}
          />
        ) : (
          <Dropdown
            popupRender={() => (
              <Menu
                items={menuItems}
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
        )}
        {/* <Button
          type="text"
          className={styles.themeBtn}
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => setDarkMode((prev) => !prev)}
        /> */}

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
