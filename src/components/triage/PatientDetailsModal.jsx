import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PropTypes from 'prop-types';
import { statusColors } from '../../utils/constants';
import FileUploadBox from '../../pages/FileUploadBox';
import { COLORS } from '../color/Colors';

// Component to display patient details in a modal
const PatientDetailsModal = ({ open, onClose, patient, position }) => {
  const [patientData, setPatientData] = useState(patient);
  const navigate = useNavigate();

  useEffect(() => {
  setPatientData(patient);
}, [patient]);


  if (!patient) return null;

  // Normalize patient data
  const phone = patient.phone || patient.mobile || patient.contact || patient.answers?.phone || 'N/A';
  const email = patient.email || patient.username || patient.answers?.email || 'N/A';
  const referrer = patient.referrer || patient.answers?.refer_physician_name || 'N/A';
  const referralReason = patient.answers?.referral_reason || patient.referral_reason || 'N/A';
  const partnerName = patient.answers?.partner_name || patient.partnerName || 'N/A';
  const hasPartner = Boolean(patient.partner || patient.answers?.partner);

  // Normalize files
  const files = patient.files
    ? Array.isArray(patient.files)
      ? patient.files.map((file, idx) => ({
          name: file.name || file.url?.split('/').pop() || `file-${idx}`,
          url: file.url || file,
        }))
      : Object.entries(patient.files || {}).map(([key, value]) => ({
          name: value.name || value.url?.split('/').pop() || key,
          url: value.url || value,
        }))
    : [];

  // Handle expand button click to navigate to patient details page
  const handleExpandClick = () => {
    onClose();
    if (patient.id) {
      navigate(`/patient-details/${patient.id}`);
    } else {
      console.warn('Patient ID is missing, cannot navigate to details page.');
    }
  };

  // Calculate modal position styles
  const getPositionStyles = () => {
    if (!position) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const modalWidth = 720;
    const modalHeight = 720;
    const minMargin = 20;
    const { left, top } = position;

    const adjustedLeft = Math.max(minMargin, Math.min(left, window.innerWidth - modalWidth - minMargin));
    const adjustedTop = Math.max(minMargin, Math.min(top, window.innerHeight - modalHeight - minMargin));

    return {
      position: 'fixed',
      left: `${adjustedLeft}px`,
      top: `${adjustedTop}px`,
      width: `${modalWidth}px`,
      maxHeight: `${modalHeight}px`,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          ...getPositionStyles(),
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: '95vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' } }}
    >
      <DialogContent sx={{ p: 0, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onClose} aria-label="Close modal">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
              Patient Information
            </Typography>
          </Box>
          <IconButton onClick={handleExpandClick} aria-label="Expand to full page">
            <OpenInFullIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {/* Action Button */}
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: COLORS.primaryHover },
              mb: 2,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Mark as complete
          </Button>

          {/* Patient Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                {patient.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                #{patient.id || 'N/A'}
              </Typography>
              <Chip
                label={Array.isArray(patient.status) ? patient.status.join(', ') : patient.status || 'N/A'}
                size="small"
                sx={{
                  backgroundColor: `${
                    statusColors[Array.isArray(patient.status) ? patient.status[0] : patient.status] || '#9CA3AF'
                  }20`,
                  color: statusColors[Array.isArray(patient.status) ? patient.status[0] : patient.status] || '#9CA3AF',
                  fontWeight: 500,
                }}
              />
            </Box>

            {/* Patient Details */}
            <Box sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, backgroundColor: '#FAFAFA' }}>
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box sx={{ flex: 1, p: 2, borderRight: `1px solid ${COLORS.border}` }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Age
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {patient.age || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Contact
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {phone}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box sx={{ flex: 1, p: 2, borderRight: `1px solid ${COLORS.border}` }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {email}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Referrer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {referrer}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box sx={{ flex: 1, p: 2, borderRight: `1px solid ${COLORS.border}` }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Referral reason
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {referralReason}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, borderRight: `1px solid ${COLORS.border}` }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Partner
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {hasPartner ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Partner Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {partnerName}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Priority
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.error, fontWeight: 500 }}>
                  {patient.priority || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Uploads Section */}
      
         <Grid item xs={6}>
  {patientData ? (
    <>
      {/* If files exist */}
      {patientData?.answers?.files &&
      Object.keys(patientData.answers.files).length > 0 ? (
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#111827', mb: 3 }}
          >
            Uploads
          </Typography>

          <Grid container spacing={3}>
            {/* Uploaded files */}
            {Object.entries(patientData.answers.files).map(([key, url]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Box
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    p: 3,
                    backgroundColor: '#F9FAFB',
                    textAlign: 'center',
                  }}
                >
                  {/* PDF placeholder */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#EF4444',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: 'white', fontWeight: 600 }}
                    >
                      PDF
                    </Typography>
                  </Box>

                  {/* File name */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#111827',
                      mb: 1,
                      fontWeight: 500,
                      wordBreak: 'break-word',
                    }}
                  >
                    {url.split('/').pop()}
                  </Typography>

                  {/* Uploaded date */}
                  <Typography
                    variant="body2"
                    sx={{ color: '#6B7280', mb: 1 }}
                  >
                    {patientData.referral_date
                      ? new Date(patientData.referral_date).toLocaleString()
                      : 'N/A'}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(url, '_blank')}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
            ))}

            {/* Upload Box at the end */}
            <Grid item xs={12} sm={6} md={4}>
              <FileUploadBox
                patient={patientData}
                onUploadSuccess={(newFiles) =>
                  setPatientData((prev) => ({
                    ...prev,
                    answers: { ...prev.answers, files: newFiles },
                  }))
                }
              />
            </Grid>
          </Grid>
        </Box>
      ) : (
        // If no files attached
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#111827', mb: 3 }}
          >
            Uploads
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#6B7280', mb: 2, textAlign: 'center' }}
          >
            No files attached.
          </Typography>

          <FileUploadBox
            patient={patientData}
            onUploadSuccess={(newFiles) =>
              setPatientData((prev) => ({
                ...prev,
                answers: { ...prev.answers, files: newFiles },
              }))
            }
          />
        </Box>
      )}
    </>
  ) : (
    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
      Patient info is loading...
    </Typography>
  )}
</Grid>


        </Box>
      </DialogContent>
    </Dialog>
  );
};

PatientDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    phone: PropTypes.string,
    mobile: PropTypes.string,
    contact: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    referrer: PropTypes.string,
    referral_reason: PropTypes.string,
    priority: PropTypes.string,
    partner: PropTypes.any,
    partnerName: PropTypes.string,
    referral_date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    files: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    answers: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
      refer_physician_name: PropTypes.string,
      referral_reason: PropTypes.string,
      partner: PropTypes.any,
      partner_name: PropTypes.string,
      files: PropTypes.any,
    }),
  }),
  position: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }),
};

export default PatientDetailsModal;