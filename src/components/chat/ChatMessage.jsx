import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import StreamingText from './StreamingText';

const ChatMessage = ({ message, onOptionClick, onStreamingComplete }) => {
  const isBot = message.type === 'bot';
  const isTyping = message.isTyping;
  
  // For streaming messages with options, start with options hidden
  // For non-streaming messages, show options immediately
  const hasOptions = message.options || message.showBooleanOptions;
  const [showOptions, setShowOptions] = useState(!message.shouldStream || !hasOptions);

  // Reset showOptions when message changes
  useEffect(() => {
    
    if (message.shouldStream && hasOptions) {
      setShowOptions(false);
    } else {
      setShowOptions(true);
    }
  }, [message.shouldStream, hasOptions, message.questionId]);

  const handleStreamComplete = () => {
    setShowOptions(true);
    // Call the parent's streaming complete handler
    if (onStreamingComplete) {
      onStreamingComplete();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      gap: 1,
      mb: 1,
      px: { xs: 1, sm: 2 }
    }}>
      <Box sx={{ 
        maxWidth: { xs: '85%', sm: '70%' },
        minWidth: isTyping ? '60px' : 'auto'
      }}>
        <Box sx={{
          bgcolor: isBot ? 'white' : 'rgba(0, 172, 187, 0.1)', // New color #00ACBB with 10% opacity
          color: isBot ? '#333' : '#333', // Changed user text to dark for better readability on light background
          p: { xs: 1, sm: 1.25 }, // Reduced padding from 1.5/2 to 1/1.25
          borderRadius: 2,
          borderTopLeftRadius: isBot ? 0.5 : 2,
          borderTopRightRadius: isBot ? 2 : 0.5,
          position: 'relative',
          wordBreak: 'break-word',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          boxShadow: isBot ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,172,187,0.2)',
          border: isBot ? '1px solid #e9ecef' : 'none'
        }}>
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <>
              {/* Message text with streaming effect for bot messages */}
              {isBot && message.shouldStream ? (
                <StreamingText 
                  text={message.message}
                  onComplete={handleStreamComplete}
                  speed={30}
                  sx={{ 
                    lineHeight: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    whiteSpace: 'pre-line'
                  }}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    lineHeight: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    whiteSpace: 'pre-line'
                  }}
                >
                  {message.message}
                </Typography>
              )}
              
              {/* Render options if this is a bot message with options and streaming is complete */}
              {isBot && message.options && showOptions && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {message.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={() => onOptionClick && onOptionClick(option.value, option.label, message.questionId)}
                      sx={{
                        borderColor: '#125A67',
                        color: '#125A67',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        borderRadius: 20,
                        py: 1,
                        '&:hover': {
                          bgcolor: 'rgba(18, 90, 103, 0.08)',
                          borderColor: '#0d434c'
                        }
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Render boolean options (Yes/No) and streaming is complete */}
              {isBot && message.showBooleanOptions && showOptions && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => onOptionClick && onOptionClick(true, 'Yes', message.questionId)}
                    sx={{
                      flex: 1,
                      borderColor: '#125A67',
                      color: '#125A67',
                      textTransform: 'none',
                      borderRadius: 20,
                      py: 1,
                      '&:hover': {
                        bgcolor: 'rgba(18, 90, 103, 0.08)',
                        borderColor: '#0d434c'
                      }
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => onOptionClick && onOptionClick(false, 'No', message.questionId)}
                    sx={{
                      flex: 1,
                      borderColor: '#125A67',
                      color: '#125A67',
                      textTransform: 'none',
                      borderRadius: 20,
                      py: 1,
                      '&:hover': {
                        bgcolor: 'rgba(18, 90, 103, 0.08)',
                        borderColor: '#0d434c'
                      }
                    }}
                  >
                    No
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const TypingIndicator = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      py: 0.5
    }}>
      {[1, 2, 3].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 8,
            height: 8,
            bgcolor: '#9CA3AF',
            borderRadius: '50%',
            animation: `typing 1.5s infinite ${dot * 0.2}s`,
            '@keyframes typing': {
              '0%, 80%, 100%': {
                opacity: 0.3,
                transform: 'scale(1)',
              },
              '40%': {
                opacity: 1,
                transform: 'scale(1.1)',
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatMessage;

