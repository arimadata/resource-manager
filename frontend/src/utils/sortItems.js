import { SORT_DIRECTIONS } from "../constants/sortDirections";

export const sortItems = ({ items, sortColumn, sortDirection, headers }) => {
  if (!sortColumn || !sortDirection || !headers.length) {
    return items;
  }

  const header = headers.find((header) => header.attribute === sortColumn);

  if (!header) {
    return items;
  }

  const ascending = sortDirection === SORT_DIRECTIONS.ASC;

  return [...items].sort((a, b) => {
    let value1 = a.resource[header.attribute] ?? header.defaultValue;
    let value2 = b.resource[header.attribute] ?? header.defaultValue;

    // Apply transform if provided
    if (header.transform) {
      value1 = header.transform(value1) ?? header.defaultValue;
      value2 = header.transform(value2) ?? header.defaultValue;
    }

    // Only apply transform if it exists, otherwise use the current value
    if (header.sortAccessor) {
      const transformedValue1 = header.transform
        ? header.transform(value1)
        : value1;
      const transformedValue2 = header.transform
        ? header.transform(value2)
        : value2;
      value1 = header.sortAccessor(transformedValue1) ?? header.defaultValue;
      value2 = header.sortAccessor(transformedValue2) ?? header.defaultValue;
    }

    // Handle different data types for comparison
    if (typeof value1 === "string" && typeof value2 === "string") {
      const comparison = value1.localeCompare(value2);
      return ascending ? comparison : -comparison;
    }

    // Handle numeric comparison (including dates converted to numbers)
    const comparison = Number(value1) - Number(value2);
    return ascending ? comparison : -comparison;
  });
};
