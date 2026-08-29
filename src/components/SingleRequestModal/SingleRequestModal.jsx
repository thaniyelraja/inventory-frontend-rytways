import { Form, InputNumber, message } from "antd";
import AppModal from "../AppModal/AppModal";
import {
  createInventoryRequest,
  updateInventoryRequest,
} from "../../utils/inventoryRequest";
import { useEffect } from "react";

const SingleRequestModal = ({
  requestSingleOpen,
  setRequestSingleOpen,
  material,
  user,
  request,
  mode,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (requestSingleOpen && mode === "edit" && request) {
      form.setFieldsValue({
        quantity: request.requestQuantity,
      });
    }
    if (requestSingleOpen && mode === "create") {
      form.resetFields();
    }
  }, [requestSingleOpen, mode, request, form]);

  return (
    <AppModal
      title={mode === "edit" ? "Edit Request" : "Request Material"}
      open={requestSingleOpen}
      onClose={() => {
        setRequestSingleOpen(false);
        form.resetFields();
      }}
      onOk={() => {
        form.submit();
      }}
      okText={mode === "edit" ? "Update Request" : "Submit Request"}
      showFooter
    >
      {material && (
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            const requestData = {
              userId: user.userId,
              items: [
                {
                  materialId: material.materialId,
                  quantity: values.quantity,
                },
              ],
            };

            try {
              if (mode === "edit") {
                await updateInventoryRequest(
                  request.inventoryRequestId,
                  requestData,
                );
                message.success("Request updated successfully", 1.5);
              } else {
                await createInventoryRequest(requestData);
                message.success("Request submitted successfully", 1.5);
              }
              await onSuccess?.();
              setRequestSingleOpen(false);
              form.resetFields();
            } catch (error) {
              message.error(
                error?.response?.data?.message ||
                  error?.response?.data ||
                  error?.message ||
                  "Failed to save request",
                2,
              );
            }
          }}
        >
          <p>
            <strong>Material : </strong>
            {material.materialName}
          </p>

          <p>
            <strong>Available : </strong>
            {material.availableQuantity}
          </p>

          <Form.Item
            label="Request Quantity"
            name="quantity"
            rules={[
              {
                required: true,
                message: "Please enter quantity",
              },
              {
                type: "number",
                min: 1,
                message: "Quantity must be at least 1",
              },
              {
                validator: (_, value) => {
                  if (value && (value <= 0 || typeof value !== "number")) {
                    return Promise.reject(
                      new Error("Please enter valid quantity"),
                    );
                  }

                  if (value && value > material.availableQuantity) {
                    return Promise.reject(
                      new Error("Quantity cannot be higher than available"),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={1} placeholder="Enter Quantity" />
          </Form.Item>
        </Form>
      )}
    </AppModal>
  );
};

export default SingleRequestModal;
