import { api } from "./api";

export const createItemAPI = async (item) => {
  try {
    const response = await api.post("/item", {
      parentPk: item.parentPk,
      itemType: item.itemType,
      name: item.name,
      resourceType: item.resourceType,
      resourcePk: item.resourcePk,
    });
    return response;
  } catch (error) {
    return error;
  }
};
