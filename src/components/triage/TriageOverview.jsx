import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { statusColors } from '../../utils/constants';
import ProgressBar from '../ui/ProgressBar';

const TriageOverview = ({ patients = [] }) => {


  // Group patients by status and count
  const statusGroups = [
    { label: 'Awaiting Review', value: patients.filter(p => p.status === 'Awaiting Review').length },
    { label: 'Pending', value: patients.filter(p => p.status === 'Pending').length },
        { label: 'Urgent', value: patients.filter(p => p.status === 'Urgent').length }, 
    { label: 'Complete', value: patients.filter(p => p.status === 'Complete').length },
    { label: 'Rejected', value: patients.filter(p => p.status === 'Rejected').length },
  ];

  const total = statusGroups.reduce((acc, s) => acc + s.value, 0);

  // For ProgressBar
  const statusBreakdown = statusGroups.map(s => ({
    label: s.label,
    value: (s.value / total) * 100 || 0
  }));

  console.log(statusGroups);

  return (
    <div className="mb-6">
      {/* Main "Patients in triage" section */}
      <Box className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start mb-3">
          {/* Left side - Main title and number */}
          <div className='text-[#053C47]'>
            <div className="flex items-baseline ">
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 500 }} className="whitespace-nowrap">
                Patients in triage
              </Typography>
            </div>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 700 }}>
              {total}
            </Typography>
          </div>

          {/* Right side - Individual status numbers */}
          <div className="flex justify-evenly w-full gap-8 mt-5">
            {statusGroups.map((status) => (
              <div key={status.label} className="text-center">
                <Typography className="text-sm text-gray-600 mb-1">{status.label}</Typography>
                <Typography 
                  className="text-2xl font-semibold text-left"
                  style={{ color: statusColors[status.label] || '#374151' }}
                >
                  {status.value}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        {/* ProgressBar */}
        <ProgressBar breakdown={statusBreakdown} />

        {/* Legend */}
        <div className="flex gap-6 mt-4">
          {statusBreakdown.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: statusColors[s.label] }}></span>
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      </Box>
    </div>
  )
};


export default TriageOverview;
