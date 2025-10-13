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
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { statusColors } from '../../utils/constants';
import FileUploadBox from '../../pages/FileUploadBox';

const PatientDetailsModal = ({ open, onClose, patient, position }) => {
  const [expandedSections, setExpandedSections] = useState({});
   const [patientData, setPatientData] = useState(patient);
  const navigate = useNavigate();

  if (!patient) return null;

  // Normalize patient data
  const phone = patient.phone || patient.mobile || patient.contact || patient.answers?.phone || 'N/A';
  const email = patient.email || patient.username || patient.answers?.email ||  'N/A';
  const referrer = patient.referrer || patient.answers?.refer_physician_name || 'N/A';
  const referralReason = patient.answers?.referral_reason || patient.referral_reason || 'N/A';
  const partnerName = patient.answers?.partner_name || patient.partnerName || 'N/A';
  const hasPartner = Boolean(patient.partner || patient.answers?.partner);

  // Normalize files
  const files = Array.isArray(patient.files)
    ? patient.files.map((file, idx) => ({
      name: file.name || file.url?.split('/').pop() || `file-${idx}`,
      url: file.url || file,
    }))
    : Object.entries(patient.files || {}).map(([key, value]) => ({
      name: value.name || value.url?.split('/').pop() || key,
      url: value.url || value,
    }));

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExpandClick = () => {
    onClose();
    navigate(`/patient-details/${patient.id}`);
  };


  const handleUploadSuccess = (newFiles) => {
    setPatientData((prev) => ({
      ...prev,
      answers: { ...prev.answers, files: newFiles },
    }));
  };

  // Simplified positioning logic
  const getPositionStyles = () => {
    if (!position) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const modalWidth = 700;
    const modalHeight = 700;
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
          width: '400px',
          maxWidth: '90vw',
        },
      }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' } }}
    >
      <DialogContent sx={{ p: 0, height: '700px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Patient Information
            </Typography>
          </Box>
          <IconButton onClick={handleExpandClick}>
            <OpenInFullIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {/* Action Button */}
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{ backgroundColor: '#125A67', '&:hover': { backgroundColor: '#0F4A54' }, mb: 2 }}
          >
            Mark as complete
          </Button>

          {/* Patient Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {patient.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                #{patient.id}
              </Typography>
              <Chip
                label={Array.isArray(patient.status) ? patient.status.join(', ') : patient.status}
                size="small"
                sx={{
                  backgroundColor: `${statusColors[Array.isArray(patient.status) ? patient.status[0] : patient.status] || '#9CA3AF'}20`,
                  color: statusColors[Array.isArray(patient.status) ? patient.status[0] : patient.status] || '#9CA3AF',
                }}
              />
            </Box>

            {/* Patient Details */}
            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, backgroundColor: '#FAFAFA' }}>
              <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Age</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{patient.age || 'N/A'}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Contact</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{phone}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{email}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Referrer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{referrer}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Referral reason</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{referralReason}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Partner</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{hasPartner ? 'Yes' : 'No'}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Partner Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{partnerName}</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Priority</Typography>
                <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 500 }}>{patient.priority || 'N/A'}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Uploads Section */}
          {/* <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>Uploads</Typography>
            <Grid container spacing={2}>
              {files.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>No files uploaded.</Typography>
                </Grid>
              ) : (
                files.map((file, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                      <CloudUploadIcon sx={{ color: '#EF4444', fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{file.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {new Date(patient.referral_date || Date.now()).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box> */}
                <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>Uploads</Typography>
            <Grid container spacing={2}>
              {files.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>No files uploaded.</Typography>
                </Grid>
              ) : (
                files.map((file, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                      <CloudUploadIcon sx={{ color: '#EF4444', fontSize: 36, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{file.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {new Date(file.date).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              )}
              <Grid item xs={6}>
                <FileUploadBox
                  patient={patientData}
                  onUploadSuccess={handleUploadSuccess}
                />
              </Grid>
            </Grid>
          </Box>


        </Box>
      </DialogContent>

    </Dialog>
  );
};

export default PatientDetailsModal;
