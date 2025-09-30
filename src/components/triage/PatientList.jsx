import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchBar from '../common/SearchBar';
import FilterDropdown from '../common/FilterDropdown';
import ViewToggle from '../common/ViewToggle';
import PatientTable from './PatientTable';
import PatientGrid from './PatientGrid';
import PaginationComponent from '../ui/Pagination';

const PatientList = ({ patients = [] }) => {
  const [view, setView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    referrer: '',
    status: '',
    priority: '',
    entryDate: '',
    age: '',
    gender: ''
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleFilterChange = (filterName) => (event) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: event.target.value
    }));
    setPage(1);
  };

  // Filter options
  const filterOptions = {
    referrer: [...new Set(patients.map(p => p.referrer))],
    status: [...new Set(patients.map(p => p.status))],
    priority: [...new Set(patients.map(p => p.priority))],
    entryDate: ['Today', 'This Week', 'This Month'],
    age: ['0-18', '19-35', '36-50', '51+'],
    gender: ['Male', 'Female', 'Other']
  };

  // Apply filters
  const filteredPatients = patients.filter(patient => {
    return (
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.referrer === '' || patient.referrer === filters.referrer) &&
      (filters.status === '' || patient.status === filters.status) &&
      (filters.priority === '' || patient.priority === filters.priority)
    );
  });

  // Pagination calculations
  const totalItems = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedPatients = filteredPatients.slice(startIndex, endIndex);

  return (
    <Box className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Typography variant="h5" className="font-semibold text-gray-700">
          Patient List
        </Typography>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        
        <FilterDropdown
          label="Referrer"
          value={filters.referrer}
          onChange={handleFilterChange('referrer')}
          options={filterOptions.referrer}
        />
        
        <FilterDropdown
          label="Status"
          value={filters.status}
          onChange={handleFilterChange('status')}
          options={filterOptions.status}
        />
        
        <FilterDropdown
          label="Priority"
          value={filters.priority}
          onChange={handleFilterChange('priority')}
          options={filterOptions.priority}
        />
        
        <FilterDropdown
          label="Entry date"
          value={filters.entryDate}
          onChange={handleFilterChange('entryDate')}
          options={filterOptions.entryDate}
        />
        
        <FilterDropdown
          label="Age"
          value={filters.age}
          onChange={handleFilterChange('age')}
          options={filterOptions.age}
        />
        
        <FilterDropdown
          label="Gender"
          value={filters.gender}
          onChange={handleFilterChange('gender')}
          options={filterOptions.gender}
        />
      </div>

      {/* Patient Views */}
      {view === 'table' ? (
        <PatientTable patients={displayedPatients} />
      ) : (
        <PatientGrid patients={displayedPatients} />
      )}

      {/* Pagination */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={totalItems === 0 ? 0 : startIndex + 1}
        endItem={endIndex}
        totalItems={totalItems}
        onPageChange={(_, newPage) => setPage(newPage)}
      />
    </Box>
  );
};

export default PatientList;
