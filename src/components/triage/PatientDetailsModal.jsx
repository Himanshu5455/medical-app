import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { statusColors } from '../../utils/constants';

const PatientDetailsModal = ({ open, onClose, patient, position, anchorPosition }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();

  if (!patient) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExpandClick = () => {
    // Navigate to full patient details page in same tab
    onClose(); // Close modal first
    navigate(`/patient-details/${patient.id}`);
  };

  // Dynamic positioning logic
  const getPositionStyles = () => {
    // Use either position or anchorPosition prop
    const positionData = position || anchorPosition;
    if (!positionData) return {};

    const modalWidth = 400; // Reduced width
    const modalHeight = 700;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minMargin = 20;

    // Handle both naming conventions: {left, top} or {x, y}
    let { left, top, x, y } = positionData;
    left = left || x;
    top = top || y;
    let positionStrategy = 'right';

    const spaceRight = windowWidth - left;
    const spaceLeft = left;
    const spaceBelow = windowHeight - top;
    const spaceAbove = top;

    if (spaceRight >= modalWidth + minMargin) {
      positionStrategy = 'right';
      left = left + 10;
    } else if (spaceLeft >= modalWidth + minMargin) {
      positionStrategy = 'left';
      left = left - modalWidth - 10;
    } else if (spaceBelow >= modalHeight + minMargin) {
      positionStrategy = 'below';
      top = top + 10;
    } else if (spaceAbove >= modalHeight + minMargin) {
      positionStrategy = 'above';
      top = top - modalHeight - 10;
    } else {
      left = (windowWidth - modalWidth) / 2;
      top = (windowHeight - modalHeight) / 2;
      positionStrategy = 'center';
    }

    if (positionStrategy === 'right' || positionStrategy === 'left') {
      if (top + modalHeight > windowHeight - minMargin) {
        top = windowHeight - modalHeight - minMargin;
      }
      if (top < minMargin) {
        top = minMargin;
      }
    }

    if (positionStrategy === 'below' || positionStrategy === 'above') {
      if (left + modalWidth > windowWidth - minMargin) {
        left = windowWidth - modalWidth - minMargin;
      }
      if (left < minMargin) {
        left = minMargin;
      }
    }

    left = Math.max(minMargin, Math.min(left, windowWidth - modalWidth - minMargin));
    top = Math.max(minMargin, Math.min(top, windowHeight - modalHeight - minMargin));

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${modalWidth}px`,
      maxHeight: `${modalHeight}px`,
      margin: 0,
      transform: 'none'
    };
  };

  // Sample data
  const alerts = [
    { type: 'info', message: 'New notes', color: '#E3F2FD' },
    { type: 'warning', message: 'High risk detected', color: '#FFF3E0' },
    { type: 'error', message: 'Incomplete Information', color: '#FFEBEE' }
  ];

  const timelineItems = [
    { label: 'Initial contact', date: '08/22/2025 10:35 AM', completed: true },
    { label: 'Symptom Assessment', date: '08/22/2025 10:52 AM', completed: true },
    { label: 'Risk Evaluation', date: '08/22/2025 10:55 AM', completed: true },
    { label: 'Exam upload', date: '08/22/2025 10:57 AM', completed: false },
    { label: 'Triage complete', date: '08/22/2025 10:59 AM', completed: false }
  ];

  const notes = [
    {
      id: 1,
      title: 'Initial Assessment',
      content: 'Lorem ipsum dolor sit amet consectetur. Sit lorem accumsan ultricies. Sed enius mauris dolor nunc tempor sem mauris sagittis et. Ornare ligula dui ut euismod vehicula mauris ipsum mauris',
      date: '08/22/2025 10:30 AM'
    },
    {
      id: 2,
      title: 'Follow-up Notes',
      content: 'Lorem ipsum dolor sit amet consectetur. Sit lorem accumsan ultricies. Sed enius mauris dolor nunc tempor sem mauris sagittis et. Ornare ligula dui ut euismod vehicula mauris ipsum mauris',
      date: '08/22/2025 11:15 AM'
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          ...getPositionStyles(),
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
      }}
    >
      <DialogContent sx={{ 
        p: 0, 
        height: '700px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Fixed Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: 3, 
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onClose} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
              Patient Information
            </Typography>
          </Box>
          <IconButton onClick={handleExpandClick} size="small">
            <OpenInFullIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content - Single Scrollbar for Entire Modal */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          }
        }}>
          <Box sx={{ p: 3 }}>
            {/* Action Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                sx={{
                  backgroundColor: '#125A67',
                  '&:hover': { backgroundColor: '#0F4A54' },
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1
                }}
              >
                Mark as complete
              </Button>
            </Box>

            {/* Patient Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  {patient.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  #{patient.id}
                </Typography>
                <Chip
                  label={patient.status}
                  size="small"
                  sx={{
                    backgroundColor: (statusColors[patient.status] || '#9CA3AF') + '20',
                    color: statusColors[patient.status] || '#9CA3AF',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              {/* Patient Details Grid - Clean table-like structure */}
              <Box sx={{ 
                border: '1px solid #E5E7EB', 
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#FAFAFA'
              }}>
                {/* Row 1 */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                  <Box sx={{ 
                    width: '50%', 
                    p: 2, 
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Age
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      {patient.age}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: '50%', 
                    p: 2,
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Contact
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      +000 000 0000
                    </Typography>
                  </Box>
                </Box>

                {/* Row 2 */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                  <Box sx={{ 
                    width: '50%', 
                    p: 2, 
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      soph.cl@email.com
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: '50%', 
                    p: 2,
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Referrer
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      Dr. Emily Carter
                    </Typography>
                  </Box>
                </Box>

                {/* Row 3 */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                  <Box sx={{ 
                    width: '33.33%', 
                    p: 2, 
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Referral reason
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      Fertility
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: '33.33%', 
                    p: 2, 
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Partner
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      Yes
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: '33.33%', 
                    p: 2,
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Topic
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                      N/A
                    </Typography>
                  </Box>
                </Box>

                {/* Row 4 */}
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ 
                    width: '100%', 
                    p: 2,
                    backgroundColor: 'white'
                  }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontSize: '0.75rem' }}>
                      Priority
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#EF4444', fontWeight: 500 }}>
                      High
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Uploads Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Uploads
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 2, 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 120,
                    backgroundColor: '#FAFAFA'
                  }}>
                    <CloudUploadIcon sx={{ color: '#EF4444', fontSize: 36, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#374151', mb: 1, fontWeight: 500 }}>
                      File name of the inp...
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      08/22/2025 10:30 AM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 2, 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 120,
                    backgroundColor: '#FAFAFA'
                  }}>
                    <CloudUploadIcon sx={{ color: '#EF4444', fontSize: 36, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#374151', mb: 1, fontWeight: 500 }}>
                      File name of the inp...
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      08/22/2025 10:30 AM
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Alerts Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Alerts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alerts.map((alert, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    backgroundColor: alert.color, 
                    borderRadius: 2,
                    border: '1px solid #E5E7EB'
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: alert.type === 'info' ? '#2196F3' : 
                                     alert.type === 'warning' ? '#FF9800' : '#F44336'
                    }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {alert.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Triage Timeline */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Triage Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {timelineItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Box sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: item.completed ? '#10B981' : 'transparent',
                      border: item.completed ? 'none' : '2px solid #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.completed && (
                        <CheckCircleIcon sx={{ color: 'white', fontSize: 12 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: item.completed ? '#374151' : '#9CA3AF' 
                      }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {item.date}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small"
                      onClick={() => toggleSection(item.label.toLowerCase().replace(' ', ''))}
                    >
                      {expandedSections[item.label.toLowerCase().replace(' ', '')] ? 
                        <ExpandLessIcon fontSize="small" /> : 
                        <ExpandMoreIcon fontSize="small" />
                      }
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Notes Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Notes
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {notes.map((note) => (
                  <Box key={note.id} sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 2, 
                    p: 3 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start', 
                      mb: 2 
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                        {note.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#374151', mb: 2, lineHeight: 1.6 }}>
                      {note.content}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {note.date}
                    </Typography>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    borderColor: '#D1D5DB',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB'
                    },
                    py: 1.5
                  }}
                >
                  + Save note
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailsModal;
