import PropTypes from "prop-types";
import "./Pagination.scss";
import { useIcon } from "../../hooks/useIcons";

const boundaryCount = 1;
const siblingCount = 1;

const createRange = (start, end) => {
  if (end < start) return [];
  const rangeLength = end - start + 1;
  const range = Array.from(
    { length: rangeLength },
    (_, index) => start + index
  );
  return range;
};

const Pagination = ({ totalPages, page, onChange }) => {
  const getIcon = useIcon();

  const handlePageChange = (newPage) => {
    const isValidPage =
      newPage >= 1 && newPage <= totalPages && newPage !== page;
    if (!isValidPage) return;
    onChange(newPage);
  };

  const startPages = createRange(1, boundaryCount);
  const endPages = createRange(totalPages - boundaryCount + 1, totalPages);

  const siblingsStartUpperBound = Math.min(
    page - siblingCount,
    totalPages - boundaryCount - siblingCount * 2 - 1
  );
  const siblingsStart = Math.max(siblingsStartUpperBound, boundaryCount + 2);

  const siblingsEndUpperBound = Math.max(
    page + siblingCount,
    boundaryCount + siblingCount * 2 + 2
  );
  const siblingsEnd = Math.min(
    siblingsEndUpperBound,
    totalPages - boundaryCount - 1
  );

  const showStartEllipsis = siblingsStart > boundaryCount + 2;
  const showStartBoundaryPage = boundaryCount + 1 < totalPages - boundaryCount;
  const startEllipsisItems = showStartEllipsis ? ["start-ellipsis"] : [];
  const startBoundaryItems =
    !showStartEllipsis && showStartBoundaryPage ? [boundaryCount + 1] : [];

  const showEndEllipsis = siblingsEnd < totalPages - boundaryCount - 1;
  const showEndBoundaryPage = totalPages - boundaryCount > boundaryCount;
  const endEllipsisItems = showEndEllipsis ? ["end-ellipsis"] : [];
  const endBoundaryItems =
    !showEndEllipsis && showEndBoundaryPage ? [totalPages - boundaryCount] : [];

  const itemList = [
    ...startPages,
    ...startEllipsisItems,
    ...startBoundaryItems,
    ...createRange(siblingsStart, siblingsEnd),
    ...endEllipsisItems,
    ...endBoundaryItems,
    ...endPages,
  ];

  return (
    <nav className="fm-pagination">
      <button
        type="button"
        className="fm-pagination-button fm-pagination-control"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        {getIcon("BsChevronBarLeft", 18)}
      </button>
      <button
        type="button"
        className="fm-pagination-button fm-pagination-control"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        {getIcon("BsChevronLeft", 18)}
      </button>

      {itemList.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            className={`fm-pagination-button fm-pagination-page ${
              item === page ? "selected" : ""
            }`}
            onClick={() => handlePageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={`${item}-${index}`} className="fm-pagination-ellipsis">
            ...
          </span>
        )
      )}

      <button
        type="button"
        className="fm-pagination-button fm-pagination-control"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        {getIcon("BsChevronRight", 18)}
      </button>
      <button
        type="button"
        className="fm-pagination-button fm-pagination-control"
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        {getIcon("BsChevronBarRight", 18)}
      </button>
    </nav>
  );
};

Pagination.displayName = "Pagination";

Pagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Pagination;
