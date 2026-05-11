import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";

const PaginationContext = createContext();

export const PaginationProvider = ({
  page: controlledPage,
  pageSize,
  allowPagination,
  onPageChange,
  children,
}) => {
  const [internalPage, setInternalPage] = useState(controlledPage ?? 1);

  const currentPage = controlledPage ?? internalPage;

  const handlePageChange = useCallback(
    (newPage) => {
      if (onPageChange) {
        onPageChange(newPage);
      } else {
        setInternalPage(newPage);
      }
    },
    [onPageChange]
  );

  const value = useMemo(
    () => ({
      currentPage,
      pageSize,
      allowPagination,
      handlePageChange,
    }),
    [currentPage, pageSize, allowPagination, handlePageChange]
  );

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
};

PaginationProvider.propTypes = {
  page: PropTypes.number,
  pageSize: PropTypes.number.isRequired,
  allowPagination: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export const usePagination = () => useContext(PaginationContext);
