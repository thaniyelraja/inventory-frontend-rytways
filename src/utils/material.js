import api from "../services/api";

export const getMaterials = async (page, size, search, status, categoryId) => {
  const response = await api.get("material/materials", {
    params: { page, size, search, status, categoryId },
  });
  return response.data;
};

export const exportMaterialsExcel = async () => {
  const response = await api.get("material/export-excel", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = url;
  link.download = "materials.xlsx";
  link.click();

  URL.revokeObjectURL(url);
};

export const getRequestDetails = async (userId, materialId) => {
  const response = await api.get("/inventory-request/view", {
    params: {
      userId,
      materialId,
    },
  });
  return response.data;
};

export const createMaterial = async (data) => {
  const response = await api.post("/material/create", data);
  return response.data;
};

export const updateMaterial = async (materialId, values) => {
  const response = await api.put(`/material/update/${materialId}`, values);
  return response.data;
};

export const deleteMaterial = async (materialId) => {
  const response = await api.delete(`/material/delete/${materialId}`);
  return response.data;
};

export const getCategoriesBySupplierId = async (supplierId) => {
  const response = await api.get(`/material/categories/${supplierId}`);
  return response.data;
};

export const getMaterialsByCategories = async (categoryId) => {
  const response = await api.get(`/material/category/${categoryId}`);
  return response.data;
};

export const getMaterialsByCategory = async (supplierId, categoryId) => {
  const response = await api.get(
    `/material/${supplierId}/category/${categoryId}`,
  );
  return response.data;
};

export const getMaterialOrders = async () => {
  const response = await api.get("/orders/all-orders");
  return response.data;
};

export const placeOrder = async (data) => {
  const response = await api.post(`/orders/order`, data);
  return response.data;
};

export const getSuppliers = async () => {
  const response = await api.get(`supplier/suppliers`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get(`material/categories`);
  return response.data;
};
