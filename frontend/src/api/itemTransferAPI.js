import { api } from "./api";

export const copyItemAPI = async (copiedItems, destinationPk) => {
  try {
    const promises = copiedItems.map((item) =>
      api.post(`/item/${item.pk}/copy`, {
        parentPk: destinationPk,
        name: item.name, // In case of rename
      })
    );
    const response = await Promise.all(promises);
    return response;
  } catch (error) {
    return error;
  }
};

export const moveItemAPI = async (copiedItems, destinationPk) => {
  try {
    const promises = copiedItems.map((item) =>
      api.patch(`/item/${item.pk}`, {
        parentPk: destinationPk,
      })
    );
    const response = await Promise.all(promises);
    return response;
  } catch (error) {
    return error;
  }
};
