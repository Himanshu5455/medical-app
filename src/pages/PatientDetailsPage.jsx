import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StatusBadge from '../components/common/StatusBadge';
import { statusColors } from '../utils/constants';
import { patients } from '../data/mockData';

const PatientDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const patient = patients.find(p => p.id === parseInt(id));

  // Handle case when patient is not found
  if (!patient) {
    return (
      <Box sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Patient not found</Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }
  
  const [expandedSections, setExpandedSections] = useState({
    initialContact: true,
    symptomAssessment: false,
    riskEvaluation: false,
    examUpload: false,
    triageComplete: false
  });

  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Note title',
      content: 'Lorem ipsum dolor sit amet consectetur. Sit lorem accumsan ultricies. Sed enius mauris dolor nunc tempor sem mauris sagittis et. Ornare ligula dui ut euismod vehicula mauris ipsum mauris',
      date: 'John Doe, Aug 5th, 2025, 1:00 AM'
    },
    {
      id: 2,
      title: 'Note title',
      content: 'Lorem ipsum dolor sit amet consectetur. Sit lorem accumsan ultricies. Sed enius mauris dolor nunc tempor sem mauris sagittis et. Ornare ligula dui ut euismod vehicula mauris ipsum mauris',
      date: 'John Doe, Aug 5th, 2025, 1:00 AM'
    }
  ]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const alerts = [
    { type: 'info', message: 'New notes', color: '#E3F2FD' },
    { type: 'error', message: 'High risk detected', color: '#FFEBEE' },
    { type: 'warning', message: 'Incomplete Information', color: '#FFF8E1' }
  ];

  const timelineItems = [
    { label: 'Initial contact', date: '08/22/2025 10:35 AM', completed: true },
    { label: 'Symptom Assessment', date: '08/22/2025 10:35 AM', completed: false },
    { label: 'Risk Evaluation', date: '08/22/2025 10:35 AM', completed: false },
    { label: 'Exam upload', date: '08/22/2025 10:35 AM', completed: false },
    { label: 'Triage complete', date: '08/22/2025 10:35 AM', completed: true }
  ];

  return (
    <Box sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827' }}>
              Patient Information
            </Typography>
          </Box>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              backgroundColor: '#125A67',
              color: 'white',
              '&:hover': { backgroundColor: '#0F4A54' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Mark as complete
          </Button>

            <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
                </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Patient Info */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 3, 
              p: 4,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              mb: 4
            }}>
              {/* Patient Info Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
                  {patient.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  #{patient.id}
                </Typography>
                <Chip
                  label={patient.status}
                  size="medium"
                  sx={{
                    backgroundColor: (statusColors[patient.status] || '#9CA3AF') + '20',
                    color: statusColors[patient.status] || '#9CA3AF',
                    fontWeight: 500
                  }}
                />
                <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
              </Box>

              {/* Patient Details Grid */}
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Age
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    {patient.age}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Contact
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    +000 000 0000
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    soph.cl@email.com
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Referrer
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    Dr. Emily Carter
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Referral reason
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    Fertility
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Partner
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    Yes
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Topic
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#111827', fontWeight: 500 }}>
                    N/A
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    Priority
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#EF4444', fontWeight: 500 }}>
                    High
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Uploads Section */}
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 3, 
              p: 4,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              mb: 4
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>
                Uploads
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 2, 
                    p: 3,
                    backgroundColor: '#F9FAFB',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      backgroundColor: '#EF4444', 
                      borderRadius: 2, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        PDF
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#111827', mb: 1, fontWeight: 500 }}>
                      File name of the inp...
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      08/22/2025 10:30 AM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 2, 
                    p: 3,
                    backgroundColor: '#F9FAFB',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      backgroundColor: '#EF4444', 
                      borderRadius: 2, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        PDF
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#111827', mb: 1, fontWeight: 500 }}>
                      File name of the inp...
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      08/22/2025 10:30 AM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{
                    border: '2px dashed #D1D5DB',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#FAFAFA',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
                      Drag and drop
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Or click to browse your files
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Notes Section */}
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 3, 
              p: 4,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>
                Notes
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {notes.map((note) => (
                  <Box key={note.id} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                        {note.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#374151', mb: 2, lineHeight: 1.6 }}>
                      {note.content}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {note.date}
                    </Typography>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    textTransform: 'none',
                    borderColor: '#D1D5DB',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB'
                    },
                    py: 2
                  }}
                >
                  + Save note
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Alerts & Timeline */}
          <Grid item xs={12} lg={4}>
            {/* Alerts Section */}
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 3, 
              p: 4,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              mb: 4
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
                Alerts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alerts.map((alert, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alert.color,
                      border: '1px solid ' + alert.color
                    }}
                  >
                    <Box sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%',
                      backgroundColor: alert.type === 'info' ? '#2196F3' : 
                                     alert.type === 'error' ? '#F44336' : '#FF9800',
                      mr: 2
                    }} />
                    <Typography variant="body1" sx={{ color: '#374151' }}>
                      {alert.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Triage Timeline Section */}
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 3, 
              p: 4,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>
                Triage Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {timelineItems.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 3,
                      border: '1px solid #E5E7EB',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#F9FAFB'
                      }
                    }}
                    onClick={() => toggleSection(item.label.toLowerCase().replace(' ', ''))}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        backgroundColor: item.completed ? '#10B981' : '#E5E7EB',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.completed && <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {item.date}
                        </Typography>
                      </Box>
                    </Box>
                    {expandedSections[item.label.toLowerCase().replace(' ', '')] ? 
                      <ExpandLessIcon sx={{ color: '#6B7280' }} /> : 
                      <ExpandMoreIcon sx={{ color: '#6B7280' }} />
                    }
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PatientDetailsPage;
