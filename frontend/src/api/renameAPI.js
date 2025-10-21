import { api } from "./api";

export const renameAPI = async (item) => {
  try {
    const response = await api.patch(`/item/${item.pk}`, {
      name: item.name,
    });
    return response;
  } catch (error) {
    return error;
  }
};
