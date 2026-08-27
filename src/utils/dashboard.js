import api from "../services/api";

export const getDashboardSummary = async (userId) => {
  const response = await api.get("/dashboard/summary", {
    params: {
      userId,
    },
  });
  return response.data;
};

export const getProductTrend = async (period, queryValue) => {
  const response = await api.get("/dashboard/trend", {
    params: {
      period,
      ...queryValue,
    },
  });
  return response.data;
};

export const getRequestStatus = async (userId) => {
  const response = await api.get("/dashboard/status", {
    params: {
      userId,
    },
  });
  return response.data;
};

export const getAdminDashboardSummary = async () => {
  const response = await api.get("/dashboard/admin/summary");
  return response.data;
};
