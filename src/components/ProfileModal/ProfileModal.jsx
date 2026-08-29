import { Avatar, Descriptions, Typography } from "antd";
import styles from "./ProfileModal.module.css";
import { UserOutlined } from "@ant-design/icons";
import AppModal from "../AppModal/AppModal";

const { Title, Text } = Typography;

const ProfileModal = ({ open, onClose, user }) => {
  return (
    <AppModal
      title="Profile"
      open={open}
      onClose={onClose}
      centered
      width={500}
    >
      <div className={styles.profile}>
        <div className={styles.profileHeader}>
          <Avatar size={80} icon={<UserOutlined />} className={styles.avatar} />
          <div>
            <Title level={3}>{user?.name || "User"}</Title>
            <Text>{user?.email || "-"} </Text>
          </div>
        </div>
        <div className={styles.divider} />

        <Title level={4}>Personal Information</Title>
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          bordered
          className={styles.details}
        >
          <Descriptions.Item label="Name">
            {user?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {user?.role || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {user?.status || "-"}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </AppModal>
  );
};

export default ProfileModal;
