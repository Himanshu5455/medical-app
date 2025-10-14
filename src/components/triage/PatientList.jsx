import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchBar from '../common/SearchBar';
import FilterDropdown from '../common/FilterDropdown';
import ViewToggle from '../common/ViewToggle';
import PatientTable from './PatientTable';
import PatientGrid from './PatientGrid';
import PaginationComponent from '../ui/Pagination';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


const PatientList = ({ patients = [], ageOptions = [] }) => {
  const [view, setView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    referrer: '',
    status: '',
    priority: '',
    entryDate: null,
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
    age: (() => {
      const AGE_BUCKETS = ['0-20', '21-50', '51-90', '91-110', '111+'];
      const hasNone = patients.some(p => !p.age || p.age === '-' || String(p.age).toLowerCase() === 'none');
      return hasNone ? [...AGE_BUCKETS, 'None'] : AGE_BUCKETS;
    })(),
    gender: ['Male', 'Female', 'Other']
  };

  const sortedPatients = [...patients].sort((a, b) =>
    new Date(b.entryDate) - new Date(a.entryDate)
  );

  const filteredPatients = sortedPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReferrer = filters.referrer === '' || patient.referrer === filters.referrer;
    const matchesStatus = filters.status === '' || patient.status === filters.status;
    const matchesPriority = filters.priority === '' || patient.priority === filters.priority;

    let matchesEntryDate = true;
    if (filters.entryDate) {
      const patientDate = new Date(patient.entryDate).toDateString();
      const selectedDate = new Date(filters.entryDate).toDateString();
      matchesEntryDate = patientDate === selectedDate;
    }

    let matchesAge = true;
    if (filters.age) {
      const selected = String(filters.age);
      const paNum = patient.ageNumber ?? (patient.age ? Number(patient.age) : NaN);

      if (selected.includes('-') || selected.endsWith('+')) {
        let min = NaN;
        let max = NaN;
        if (selected.endsWith('+')) {
          const minS = selected.replace('+', '').trim();
          min = Number(minS);
          max = Infinity;
        } else {
          const parts = selected.split('-').map(s => s.trim());
          min = Number(parts[0]);
          max = Number(parts[1]);
        }

        if (Number.isNaN(min) || Number.isNaN(max)) {
          matchesAge = false;
        } else if (!Number.isNaN(paNum)) {
          matchesAge = paNum >= min && paNum <= max;
        } else {
          matchesAge = false;
        }
      } else {
        const selNum = Number(selected);
        if (!Number.isNaN(selNum) && !Number.isNaN(paNum)) {
          matchesAge = paNum === selNum;
        } else if (selected.toLowerCase() === 'none') {
          matchesAge = !patient.age || patient.age === '-' || String(patient.age).toLowerCase() === 'none';
        } else {
          const patientAgeStr = patient.age === '-' ? '' : String(patient.age);
          matchesAge = patientAgeStr === selected;
        }
      }
    }

    return matchesSearch && matchesReferrer && matchesStatus && matchesPriority && matchesEntryDate && matchesAge;
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
      <div className="flex flex-wrap lg:flex-nowrap gap-3 mb-6">
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
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Entry Date"
            value={filters.entryDate}
            onChange={(newDate) => {
              setFilters(prev => ({ ...prev, entryDate: newDate }));
              setPage(1);
            }}
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 180 }
              }
            }}
          />
        </LocalizationProvider>


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
