import { Modal } from "antd";

const ConfirmationModal = ({
  title = "Are you sure?",
  content = "Are you sure want to continue?",
  okText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}) => {
  Modal.confirm({
    title,
    content,
    okText,
    cancelText,
    okType: "danger",
    onOk: onConfirm,
  });
};

export default ConfirmationModal;
