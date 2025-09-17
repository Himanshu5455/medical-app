import React, { useState, useRef, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


import { 
  Box, 
  TextField, 
  Button, 
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';

const ChatInput = ({ question, currentAnswer, onAnswer, disabled, isStreamingActive, filesPermission }) => {
  const [inputValue, setInputValue] = useState(currentAnswer || '');
  const [files, setFiles] = useState(currentAnswer && Array.isArray(currentAnswer) ? currentAnswer : []);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Update input values when question or currentAnswer changes
  useEffect(() => {
    if (question?.type === 'file' && Array.isArray(currentAnswer)) {
      setFiles(currentAnswer);
      setInputValue('');
    } else {
      setInputValue(currentAnswer || '');
      setFiles([]);
    }
    setError(''); // Clear any previous errors
  }, [question?.id, currentAnswer]); // Only re-run when question ID or answer changes

  // const handleSubmit = (value = inputValue) => {
  //   // Prevent submission if streaming is active
  //   if (isStreamingActive) {
  //     return;
  //   }
    
  //   // For file inputs, use files array instead of inputValue
  //   const submitValue = question.type === 'file' ? files : value;
    
  //   if (question.required && (!submitValue || (Array.isArray(submitValue) && submitValue.length === 0) || submitValue === '')) {
  //     setError(`${question.question} is required`);
  //     return;
  //   }

  //   if (question.validation) {
  //     const validationError = question.validation(submitValue);
  //     if (validationError) {
  //       setError(validationError);
  //       return;
  //     }
  //   }

  //   setError('');
  //   onAnswer(submitValue);
    
  //   // Clear inputs based on type
  //   if (question.type === 'file') {
  //     setFiles([]);
  //   } else {
  //     setInputValue('');
  //   }
  // };


// const handleSubmit = (value = inputValue) => {
//   // Prevent submission if streaming is active
//   if (isStreamingActive) {
//     return;
//   }

//   let submitValue;

//   // ✅ Special handling for files_permission
//   if (question.id === "files_permission") {
//     if (value === false) {
//       // User clicked NO → call API immediately without waiting for files
//       setError("");
//       onAnswer(false);
//       return; // exit early
//     }
//   }

//   // Normalize values based on question type
//   if (question.type === "file") {
//     submitValue = files;
//   } else if (question.type === "date") {
//     // Convert Date -> "DD/MM/YYYY" string to keep Redux state serializable
//     if (value instanceof Date) {
//       const d = value;
//       const day = String(d.getDate()).padStart(2, "0");
//       const month = String(d.getMonth() + 1).padStart(2, "0");
//       const year = String(d.getFullYear());
//       submitValue = `${day}/${month}/${year}`; // e.g. 06/09/2025
//     } else if (typeof value === "string" && value.includes("-")) {
//       // If we received an ISO-like string, convert to DD/MM/YYYY
//       const parts = value.split("-"); // [YYYY, MM, DD]
//       if (parts.length === 3) {
//         submitValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
//       } else {
//         submitValue = value || "";
//       }
//     } else {
//       submitValue = value || "";
//     }
//   } else {
//     submitValue = value;
//   }

//   // Handle required validation
//   if (
//     question.required &&
//     (!submitValue ||
//       (Array.isArray(submitValue) && submitValue.length === 0) ||
//       submitValue === "")
//   ) {
//     setError(`${question.question} is required`);
//     return;
//   }

//   // Custom validation if provided
//   if (question.validation) {
//     const validationError = question.validation(submitValue);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
//   }

//   setError("");
//   onAnswer(submitValue);

//   // Clear inputs based on type
//   if (question.type === "file") {
//     setFiles([]);
//   } else {
//     setInputValue("");
//   }
// };


const handleSubmit = (value = inputValue) => {
  // Prevent submission if streaming is active
  if (isStreamingActive) {
    return;
  }

  let submitValue;

  // ✅ Special handling for files_permission
  if (question.id === "files_permission") {
    if (value === false) {
      // User clicked NO → call API immediately without waiting for files
      setError("");
      onAnswer(false);
      return; // exit early
    }
  }

  // Normalize values based on question type
  if (question.type === "file") {
    submitValue = files;
  } else if (question.type === "date") {
    if (value instanceof Date) {
      // Convert Date -> "DD/MM/YYYY"
      const d = value;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear());
      submitValue = `${day}/${month}/${year}`;
    } else if (typeof value === "string" && value.includes("-")) {
      // Convert "YYYY-MM-DD" to "DD/MM/YYYY"
      const parts = value.split("-");
      if (parts.length === 3) {
        submitValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        submitValue = value || "";
      }
    } else {
      submitValue = value || "";
    }
  } else {
    submitValue = value;
  }

  // ✅ Modified required validation
  if (
    question.required &&
    (!submitValue ||
      (Array.isArray(submitValue) && submitValue.length === 0) ||
      submitValue === "")
  ) {
    // ✅ Allow skipping file upload if user selected NO
    if (question.id === "files" && filesPermission === false) {
      // Skip validation → allow API call
    } else {
      setError(`${question.question} is required`);
      return;
    }
  }

  // Custom validation if provided
  if (question.validation) {
    const validationError = question.validation(submitValue);
    if (validationError) {
      setError(validationError);
      return;
    }
  }

  // ✅ If everything is fine, call API
  setError("");
  onAnswer(submitValue);

  // Clear inputs based on type
  if (question.type === "file") {
    setFiles([]);
  } else {
    setInputValue("");
  }
};


  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileData = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
    
    setFiles(prev => [...prev, ...fileData]);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };


const renderInput = () => {
  switch (question.type) {
    case "text":
    case "email":
    case "tel":
      return (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: "100%",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* <IconButton
            sx={{
              color: "#125A67",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(18, 90, 103, 0.08)",
                color: "#0d434c",
              },
            }}
          >
            <AddIcon fontSize="medium" />
          </IconButton> */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            type={question.type}
            size="small"
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 20,
                backgroundColor: "white",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
            }}
          />
          <IconButton
            onClick={() => handleSubmit()}
            disabled={
              disabled ||
              (typeof inputValue === "string"
                ? !inputValue.trim()
                : !inputValue) ||
              isStreamingActive
            }
            sx={{
              bgcolor: "#125A67",
              color: "white !important",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": { bgcolor: "#0d434c", color: "white !important" },
              "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
            }}
          >
            <SendIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
      );

    // case "boolean":
  //  case "boolean":
  // return (
  //   <Box
  //     sx={{
  //       display: "flex",
  //       gap: 1,
  //       alignItems: "center",
  //       width: "100%",
  //       px: { xs: 1, sm: 2 },
  //     }}
  //   >
  //     <TextField
  //       fullWidth
  //       variant="outlined"
  //       value={inputValue === true ? "Yes" : inputValue === false ? "No" : ""}
  //       placeholder="Select Yes or No"
  //       InputProps={{
  //         readOnly: true, 
  //       }}
  //       size="small"
  //       sx={{
  //         flex: 1,
  //         "& .MuiOutlinedInput-root": {
  //           borderRadius: 20,
  //           backgroundColor: "white",
  //         },
  //       }}
  //       disabled={disabled}
  //     />
  //   </Box>
  // );

case "boolean":
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        width: "100%",
        px: { xs: 1, sm: 2 },
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        value={inputValue === true ? "Yes" : inputValue === false ? "No" : ""}
        placeholder="Select Yes or No"
        InputProps={{
          readOnly: true,
        }}
        size="small"
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 20,
            backgroundColor: "white",
          },
        }}
        disabled={disabled}
      />

      {/* Yes Button */}
      <Button
        variant="outlined"
        onClick={() => {
          if (question.id === "files_permission") {
            handleSubmit(true); // auto-submit only for file permission
          } else {
            setInputValue(true);
          }
        }}
        disabled={disabled}
        sx={{
          borderRadius: 20,
          textTransform: "none",
          minWidth: 64,
        }}
      >
        Yes
      </Button>

      {/* No Button */}
      <Button
        variant="outlined"
        onClick={() => {
          if (question.id === "files_permission") {
            handleSubmit(false); // auto-submit only here
          } else {
            setInputValue(false);
          }
        }}
        disabled={disabled}
        sx={{
          borderRadius: 20,
          textTransform: "none",
          minWidth: 64,
        }}
      >
        No
      </Button>
    </Box>
  );

    case "select":
      return (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: "100%",
            px: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            sx={{
              color: "#125A67",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(18, 90, 103, 0.08)",
                color: "#0d434c",
              },
            }}
          >
            <AddIcon fontSize="medium" />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            size="small"
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 20,
                backgroundColor: "white",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#125A67" },
                "&.Mui-focused fieldset": { borderColor: "#125A67" },
              },
            }}
          />
          <IconButton
            onClick={() => handleSubmit()}
            disabled={
              disabled ||
              (typeof inputValue === "string"
                ? !inputValue.trim()
                : !inputValue) ||
              isStreamingActive
            }
            sx={{
              bgcolor: "#125A67",
              color: "white !important",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": { bgcolor: "#0d434c", color: "white !important" },
              "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
            }}
          >
            <SendIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
      );

case "date":
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        width: "100%",
        px: { xs: 1, sm: 2 },
      }}
    >
      <IconButton
        sx={{
          color: "#125A67",
          width: 40,
          height: 40,
          flexShrink: 0,
          "&:hover": {
            bgcolor: "rgba(18, 90, 103, 0.08)",
            color: "#0d434c",
          },
        }}
      >
        <AddIcon fontSize="medium" />
      </IconButton>

      {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select your date of birth"
          value={inputValue || null}
          onChange={(newValue) => setInputValue(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  backgroundColor: "white",
                },
              }}
              disabled={disabled}
            />
          )}
        />
      </LocalizationProvider> */}


      <LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Select your date of birth"
    value={inputValue || null}
    onChange={(newValue) => setInputValue(newValue)}
    slotProps={{
      textField: {
        fullWidth: true, // ✅ makes it stretch full width
        size: "small",
        disabled: disabled,
        sx: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 20,
            backgroundColor: "white",
          },
        },
      },
    }}
    maxDate={new Date()} // ✅ optional: prevent picking future dates
  />
</LocalizationProvider>


      <IconButton
        onClick={() => handleSubmit(inputValue)}
        disabled={!inputValue || disabled || isStreamingActive}
        sx={{
          bgcolor: "#125A67",
          color: "white !important",
          width: 40,
          height: 40,
          flexShrink: 0,
          "&:hover": { bgcolor: "#0d434c", color: "white !important" },
          "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
        }}
      >
        <SendIcon sx={{ color: "white" }} />
      </IconButton>
    </Box>
  );


    // case "file":
    //   return (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         flexDirection: "column",
    //         gap: 1,
    //         width: "100%",
    //         px: { xs: 1, sm: 2 },
    //         py: 0.5,
    //         minHeight: "60px",
    //         justifyContent: "flex-end",
    //       }}
    //     >
    //       <input
    //         type="file"
    //         ref={fileInputRef}
    //         onChange={handleFileUpload}
    //         accept={question.accept || "*/*"}
    //         multiple={question.multiple || false}
    //         style={{ display: "none" }}
    //       />

    //       {files.length > 0 && (
    //         <Paper variant="outlined" sx={{ p: 1, maxHeight: 80, overflow: "auto" }}>
    //           <Typography
    //             variant="caption"
    //             sx={{ mb: 0.5, color: "#374151", display: "block" }}
    //           >
    //             Files: {files.length}
    //           </Typography>
    //           <List dense sx={{ py: 0 }}>
    //             {files.map((file, index) => (
    //               <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
    //                 <AttachFileIcon
    //                   sx={{ mr: 0.5, color: "#125A67", fontSize: 14 }}
    //                 />
    //                 <ListItemText
    //                   primary={file.name}
    //                   secondary={`${(file.size / 1024).toFixed(1)} KB`}
    //                   sx={{
    //                     "& .MuiListItemText-primary": { fontSize: "0.75rem" },
    //                     "& .MuiListItemText-secondary": { fontSize: "0.65rem" },
    //                   }}
    //                 />
    //                 <ListItemSecondaryAction>
    //                   <IconButton
    //                     edge="end"
    //                     size="small"
    //                     onClick={() => handleRemoveFile(index)}
    //                     sx={{ color: "#EF4444" }}
    //                   >
    //                     <DeleteIcon fontSize="small" />
    //                   </IconButton>
    //                 </ListItemSecondaryAction>
    //               </ListItem>
    //             ))}
    //           </List>
    //         </Paper>
    //       )}

    //       <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
    //         <Button
    //           variant="outlined"
    //           startIcon={<CloudUploadIcon />}
    //           onClick={() => fileInputRef.current?.click()}
    //           disabled={disabled}
    //           sx={{
    //             borderColor: "#125A67",
    //             color: "#125A67",
    //             "&:hover": { borderColor: "#0d434c", bgcolor: "#125A67" },
    //             borderRadius: 20,
    //             textTransform: "none",
    //             flex: 1,
    //           }}
    //         >
    //           Send an image
    //         </Button>

    //         <Button
    //           variant="outlined"
    //           startIcon={<AttachFileIcon />}
    //           onClick={() => fileInputRef.current?.click()}
    //           disabled={disabled}
    //           sx={{
    //             borderColor: "#125A67",
    //             color: "#125A67",
    //             "&:hover": { borderColor: "#0d434c", bgcolor: "#125A67" },
    //             borderRadius: 20,
    //             textTransform: "none",
    //             flex: 1,
    //           }}
    //         >
    //           Send a file
    //         </Button>
    //       </Box>

    //       {files.length > 0 && (
    //         <Box sx={{ display: "flex", justifyContent: "center" }}>
    //           <IconButton
    //             onClick={() => handleSubmit()}
    //             disabled={disabled || isStreamingActive}
    //             sx={{
    //               bgcolor: "#125A67",
    //               color: "white !important",
    //               width: 48,
    //               height: 48,
    //               "&:hover": { bgcolor: "#0d434c", color: "white !important" },
    //             }}
    //           >
    //             <SendIcon sx={{ color: "white" }} />
    //           </IconButton>
    //         </Box>
    //       )}

    //       {error && (
    //         <Typography
    //           variant="caption"
    //           color="error"
    //           sx={{ mt: 1, textAlign: "center" }}
    //         >
    //           {error}
    //         </Typography>
    //       )}
    //     </Box>
    //   );

case "file":
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
        px: { xs: 1, sm: 2 },
        py: 0.5,
        minHeight: "60px",
        justifyContent: "flex-end",
      }}
    >
      {/* hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept={question.accept || "*/*"}
        multiple={question.multiple || false}
        style={{ display: "none" }}
      />

      {/* preview uploaded files */}
      {files.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1, maxHeight: 80, overflow: "auto" }}>
          <Typography
            variant="caption"
            sx={{ mb: 0.5, color: "#374151", display: "block" }}
          >
            Files: {files.length}
          </Typography>
          <List dense sx={{ py: 0 }}>
            {files.map((file, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                <AttachFileIcon
                  sx={{ mr: 0.5, color: "#125A67", fontSize: 14 }}
                />
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  sx={{
                    "& .MuiListItemText-primary": { fontSize: "0.75rem" },
                    "& .MuiListItemText-secondary": { fontSize: "0.65rem" },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{ color: "#EF4444" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* single upload button */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          sx={{
            borderColor: "#125A67",
            color: "#125A67",
            "&:hover": { borderColor: "#0d434c", bgcolor: "#125A67", color: "white" },
            borderRadius: 20,
            textTransform: "none",
            flex: 1,
          }}
        >
          Upload files
        </Button>
      </Box>

      {/* send button after upload */}
      {files.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={() => handleSubmit()}
            disabled={disabled || isStreamingActive}
            sx={{
              bgcolor: "#125A67",
              color: "white !important",
              width: 48,
              height: 48,
              "&:hover": { bgcolor: "#0d434c", color: "white !important" },
            }}
          >
            <SendIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
      )}

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, textAlign: "center" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );


    default:
      return (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: "100%",
            px: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            sx={{
              color: "#125A67",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(18, 90, 103, 0.08)",
                color: "#0d434c",
              },
            }}
          >
            <AddIcon fontSize="medium" />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            size="small"
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 20,
                backgroundColor: "white",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
            }}
          />
          <IconButton
            onClick={() => handleSubmit()}
            disabled={
              disabled ||
              (typeof inputValue === "string"
                ? !inputValue.trim()
                : !inputValue) ||
              isStreamingActive
            }
            sx={{
              bgcolor: "#125A67",
              color: "white !important",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": { bgcolor: "#0d434c", color: "white !important" },
              "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
            }}
          >
            <SendIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
      );
  }
};


  return (
    <Box sx={{ 
      minHeight: '60px', // Ensure consistent minimum height
      minWidth: '100%', // Ensure full width is maintained
      display: 'flex',
      alignItems: 'flex-end', // Align content to bottom for consistency
      width: '100%' // Explicit full width
    }}>
      {renderInput()}
    </Box>
  );
};

export default ChatInput;
