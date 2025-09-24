import { SORT_DIRECTIONS } from "../constants/sortDirections";

export const sortItems = ({ items, sortColumn, sortDirection, headers }) => {
  if (!sortColumn || !sortDirection || !headers.length) {
    return items;
  }

  const header = headers.find((header) => header.columnName === sortColumn);

  if (!header) {
    return items;
  }

  const ascending = sortDirection === SORT_DIRECTIONS.ASC;

  return [...items].sort((a, b) => {
    let value1 = header.getValue(a);
    let value2 = header.getValue(b);

    // Only apply transform if it exists, otherwise use the current value
    if (header.sortAccessor) {
      value1 = header.sortAccessor(value1, a);
      value2 = header.sortAccessor(value2, b);
    }

    let comparison = 0; // value1 === value2

    if (value1 < value2) {
      comparison = -1;
    } else if (value1 > value2) {
      comparison = 1;
    }

    return ascending ? comparison : -comparison;
  });
};
