import api from "../services/api";

export const createInventoryRequest = async (data) => {
  const response = await api.post("/inventory-request/request", data);
  return response.data;
};

export const createInventoryRequests = async (data) => {
  const response = await api.post("/inventory-request/requests", data);
  return response.data;
};

export const updateInventoryRequest = async (requestId, data) => {
  const response = await api.put(
    `/inventory-request/update/${requestId}`,
    data,
  );
  return response.data;
};

export const deleteInventoryRequest = async (requestId) => {
  const response = await api.delete(`/inventory-request/delete/${requestId}`);
  return response.data;
};

export const manageInventoryRequest = async (
  requestId,
  action,
  requestData,
) => {
  const response = await api.put(
    `/inventory-request/manage/${requestId}/${action}`,
    requestData,
  );
  return response.data;
};

export const getInventoryRequest = async (
  page,
  size,
  search,
  status,
  userId,
) => {
  const response = await api.get("inventory-request/request", {
    params: {
      page,
      size,
      search,
      status,
      userId,
    },
  });

  return response.data;
};

export const getInventoryRequestsManage = async (page, size, search) => {
  const response = await api.get("/inventory-request/requests-manage", {
    params: {
      page,
      size,
      search,
    },
  });
  return response.data;
};

export const getInventoryRequestsView = async (page, size, search) => {
  const response = await api.get("/inventory-request/requests-view", {
    params: {
      page,
      size,
      search,
    },
  });
  return response.data;
};
