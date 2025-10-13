import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { patchCustomerFiles } from '../services/api';


const FileUploadBox = ({ patient, onUploadSuccess }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('new_files', file); 

  try {
  const formData = new FormData();
  formData.append('new_files', file); 

  const response = await patchCustomerFiles(patient.id, formData);

  alert(response.message || 'File uploaded successfully!');

  onUploadSuccess?.(response.files);

  console.log('Upload response:', response);
} catch (error) {
  console.error('Error uploading file:', error);
  alert(error.response?.data?.message || 'Upload failed!');
}

  };

  return (
    <Box
      sx={{
        border: '2px dashed #D1D5DB',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#F3F4F6' },
      }}
      onClick={handleClick}
    >
      <CloudUploadIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 2 }} />
      <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
        Drag and drop
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280' }}>
        Or click to browse your files
      </Typography>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default FileUploadBox;
