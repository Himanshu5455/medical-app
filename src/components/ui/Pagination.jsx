import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

const PaginationComponent = ({ 
  currentPage = 6, 
  totalPages = 14, 
  startItem = 1, 
  endItem = 6, 
  totalItems = 100, 
  onPageChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-lg shadow-sm">
      <Typography variant="body2" className="text-gray-600">
        {startItem}-{endItem} of {totalItems} patients
      </Typography>
      
      <div className="flex items-center gap-2">
        <Typography variant="body2" className="text-gray-600">
          Page {currentPage} of {totalPages}
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={onPageChange}
          color="primary"
          size="small"
        />
      </div>
    </div>
  );
};

export default PaginationComponent;
