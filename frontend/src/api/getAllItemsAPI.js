import { api } from "./api";

export const getAllItemsAPI = async () => {
  try {
    return await api.get("/items?resourceType=report");
  } catch (error) {
    return error;
  }
};
