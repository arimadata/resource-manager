import { api } from "./api";

export const favoriteAPI = async (item) => {
  try {
    const response = await api.patch(`/item/${item.pk}/favorite`, {
      favorited: item.isFavorited,
    });
    return response;
  } catch (error) {
    return error;
  }
};
