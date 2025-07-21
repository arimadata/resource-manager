import { api } from "./api";

export const deleteAPI = async (item) => {
  try {
    const response = await api.delete(`/item/${item.pk}`);
    return response;
  } catch (error) {
    return error;
  }
};
