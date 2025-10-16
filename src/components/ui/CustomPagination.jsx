import React from 'react';

const CustomPagination = ({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const goToFirstPage = () => onPageChange(1);
  const goToLastPage = () => onPageChange(totalPages);
  const goToPrevPage = () => onPageChange(currentPage > 1 ? currentPage - 1 : 1);
  const goToNextPage = () => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages);

  return (
    <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg shadow-sm text-gray-600 text-sm">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Center: Pagination buttons */}
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
        >
          {"<<"}
        </button>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={goToPrevPage}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
        >
          {">>"}
        </button>
      </div>

      {/* Right: Showing items count */}
      <div>
        {totalItems === 0
          ? "0-0 of 0 patients"
          : `${startItem}-${endItem} of ${totalItems} patients`}
      </div>
    </div>
  );
};

export default CustomPagination;
