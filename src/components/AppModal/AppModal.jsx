import styles from "./AppModal.module.css";
import { Modal } from "antd";

const AppModal = ({
  open,
  onClose,
  title,
  children,
  width = 600,
  showFooter = false,
  footer = null,
  centered = true,
  closable = true,
  maskClosable = true,
  destroyOnHidden = false,
  loading = false,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      width={width}
      centered={centered}
      closable={closable}
      mask={{
        closable: maskClosable,
      }}
      destroyOnHidden={destroyOnHidden}
      confirmLoading={loading}
      okText={okText}
      cancelText={cancelText}
      onOk={onOk}
      footer={showFooter ? (footer ?? undefined) : null}
      classNames={{
        root: styles.modal,
        mask: styles.mask,
      }}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
