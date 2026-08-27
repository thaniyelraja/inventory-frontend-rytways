import api from "../services/api";

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getUser();
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const loginUser = async (cred) => {
  const response = await api.post("/auth/login", cred);
  return response.data;
};
