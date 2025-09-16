import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const StreamingText = ({ 
  text, 
  speed = 30, // milliseconds between characters
  onComplete = null,
  sx = {},
  variant = "body2" 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length && !isComplete) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <Typography 
      variant={variant}
      sx={{ 
        lineHeight: 1.5,
        fontSize: { xs: '0.875rem', sm: '1rem' },
        whiteSpace: 'pre-line',
        ...sx
      }}
    >
      {displayText}
      {!isComplete && (
        <span 
          style={{ 
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}
        >
          |
        </span>
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Typography>
  );
};

export default StreamingText;