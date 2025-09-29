import { createContext, useContext, useState } from "react";
import { SORT_DIRECTIONS } from "../constants/sortDirections";
import PropTypes from "prop-types";

const SortingContext = createContext();

export const SortingProvider = ({ children }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(
        sortDirection === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC
      );
    } else {
      setSortColumn(column);
      setSortDirection(SORT_DIRECTIONS.ASC);
    }
  };

  const resetSort = () => {
    setSortColumn(null);
    setSortDirection(SORT_DIRECTIONS.ASC);
  };

  return (
    <SortingContext.Provider
      value={{
        sortColumn,
        sortDirection,
        handleSort,
        resetSort,
        setSortColumn,
        setSortDirection,
      }}
    >
      {children}
    </SortingContext.Provider>
  );
};

SortingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSorting = () => useContext(SortingContext);
