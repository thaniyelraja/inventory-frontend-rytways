import api from "../services/api";

export const getUsers = async (page, size, search) => {
  const response = await api.get("/user/users", {
    params: {
      page,
      size,
      search,
    },
  });
  return response.data;
};
