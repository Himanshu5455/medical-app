

import React, { useEffect, useRef, useState } from 'react';

import { getVisibleQuestions } from '../data/questions';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Container,
  Typography, 
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { 
  setAnswer, 
  addToChatHistory, 
  removeToChatHistory,
  nextQuestion,
  completeQuestionnaire,
  loadFromStorage,
  resetQuestionnaire
} from '../store/questionnaireSlice';
import { QUESTIONS } from '../data/questions';

const ChatbotQuestionnaire = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    currentQuestionIndex, 
    answers, 
    chatHistory, 
    isCompleted 
  } = useSelector((state) => state.questionnaire);
  
  const chatContainerRef = useRef(null);
  const initializedRef = useRef(false);

  const visibleQuestions = getVisibleQuestions(answers);
const currentQuestion = visibleQuestions[currentQuestionIndex];
  
  // Track streaming state to disable input during streaming
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  // When true, hide input while waiting for user confirmation after summary
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);

  // Handler for when streaming completes
  const handleStreamingComplete = () => {
    setIsStreamingActive(false);
  };

  // Check if user has started messaging (answered at least one question)
  const hasUserStartedMessaging = Object.values(answers).some(value => 
    value !== '' && value !== null && value !== undefined && 
    !(Array.isArray(value) && value.length === 0)
  );

  // Reset chat function
  const handleStartNewChat = () => {
    dispatch(resetQuestionnaire());
    localStorage.removeItem('questionnaire');
    initializedRef.current = false;
    setIsAwaitingConfirmation(false);
    
    // Send welcome message and first question again
    setTimeout(() => {
      setIsStreamingActive(true); // Set streaming state
      dispatch(addToChatHistory({
        type: 'bot',
        message: "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
        timestamp: new Date().toISOString(),
        questionId: 'welcome',
        shouldStream: true
      }));

      // Wait for welcome message to finish streaming before sending first question
      setTimeout(() => {
        setIsStreamingActive(true); // Set streaming state  
        const firstQuestion = getVisibleQuestions(answers)[0];
        const messageData = {
          type: 'bot',
          message: firstQuestion.question,
          timestamp: new Date().toISOString(),
          questionId: firstQuestion.id,
          shouldStream: true
        };

        // Add options if question has them
        if (firstQuestion.type === 'select' && firstQuestion.options) {
          messageData.options = firstQuestion.options;
        } else if (firstQuestion.type === 'boolean') {
          messageData.showBooleanOptions = true;
        }

        dispatch(addToChatHistory(messageData));
      }, 4600); // Wait for welcome message to complete streaming
    }, 500);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Load from localStorage and initialize (only once)
  useEffect(() => {
    if (initializedRef.current) return;
    
    // Clear localStorage for fresh start (temporary for debugging)
    // localStorage.removeItem('questionnaire'); // Uncomment this line to reset
    
    const savedData = localStorage.getItem('questionnaire');
    let shouldSendFirstQuestion = true;
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch(loadFromStorage(parsed));
        
        // Only skip first question if there's already chat history
        if (parsed.chatHistory && parsed.chatHistory.length > 0) {
          shouldSendFirstQuestion = false;
        }
      } catch (error) {
        console.error('Error loading saved questionnaire data:', error);
      }
    }

    
    if (shouldSendFirstQuestion && QUESTIONS.length > 0) {
      
      // Send welcome message immediately
      setIsStreamingActive(true); // Set streaming state
      dispatch(addToChatHistory({
        type: 'bot',
        message: "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
        timestamp: new Date().toISOString(),
        questionId: 'welcome',
        shouldStream: true
      }));

      // Send the actual first question after welcome message completes streaming
      // Welcome message has ~120 characters, at 30ms per char = ~3600ms + 1000ms buffer = 4600ms
      setTimeout(() => {
        
        setIsStreamingActive(true); // Set streaming state
        // const firstQuestion = QUESTIONS[0];
        const firstQuestion = getVisibleQuestions(answers)[0];
        const messageData = {
          type: 'bot',
          message: firstQuestion.question,
          timestamp: new Date().toISOString(),
          questionId: firstQuestion.id,
          shouldStream: true
        };

        // Add options if question has them
        if (firstQuestion.type === 'select' && firstQuestion.options) {
          messageData.options = firstQuestion.options;
        } else if (firstQuestion.type === 'boolean') {
          messageData.showBooleanOptions = true;
        }
        
        dispatch(addToChatHistory(messageData));
      }, 4600); // Increased delay to allow welcome message to finish streaming
    }
    
    initializedRef.current = true;
  }, []); // Empty dependency array to run only once

  // Save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      currentQuestionIndex,
      answers,
      chatHistory,
      isCompleted
    };
    localStorage.setItem('questionnaire', JSON.stringify(dataToSave));
  }, [currentQuestionIndex, answers, chatHistory, isCompleted]);



  const handleAnswer = (value) => {
  const question = currentQuestion; // already from visibleQuestions
  if (!question) return;

  // Add user message
  dispatch(addToChatHistory({
    type: 'user',
    message: formatUserAnswer(question, value),
    timestamp: new Date().toISOString(),
    questionId: question.id
  }));

  // Save answer
  dispatch(setAnswer({
    field: question.id,
    value: value
  }));

  // ✅ Recalculate visible questions AFTER saving answer
  const updatedVisibleQuestions = getVisibleQuestions({
    ...answers,
    [question.id]: value
  });

  const nextIndex = currentQuestionIndex + 1;
  const nextQ = updatedVisibleQuestions[nextIndex];

  if (nextQ) {
    // Show typing
    const thinkingMessageId = Date.now();
    dispatch(addToChatHistory({
      type: 'bot',
      message: '',
      isTyping: true,
      timestamp: new Date().toISOString(),
      questionId: `thinking-${thinkingMessageId}`
    }));

    setTimeout(() => {
      dispatch(removeToChatHistory(`thinking-${thinkingMessageId}`));

      setIsStreamingActive(true);

      let botMessage = nextQ.question;
      if (nextQ.id === 'exams_to_share') {
        botMessage = "Do you have any exams to share with us?";
      }

      const messageData = {
        type: 'bot',
        message: botMessage,
        timestamp: new Date().toISOString(),
        questionId: nextQ.id,
        shouldStream: true
      };

      if (nextQ.type === 'select' && nextQ.options) {
        messageData.options = nextQ.options;
      } else if (nextQ.type === 'boolean') {
        messageData.showBooleanOptions = true;
      }

      dispatch(addToChatHistory(messageData));
      dispatch(nextQuestion()); // keep Redux index in sync with visible
    }, 1500);
  } else {
    // no next → completion
    const thinkingMessageId = Date.now();
    dispatch(addToChatHistory({
      type: 'bot',
      message: '',
      isTyping: true,
      timestamp: new Date().toISOString(),
      questionId: `thinking-${thinkingMessageId}`
    }));

    setTimeout(() => {
      dispatch(removeToChatHistory(`thinking-${thinkingMessageId}`));

      setIsStreamingActive(true);
      
      // If the last answered question was file upload, add a summary message from localStorage
      if (question.id === 'files') {
        let savedName = answers?.name || '';
        let savedEmail = answers?.email || '';
        let savedPhone = answers?.phone || '';
        let savedDob = answers?.dob || '';
        let savedReferral = answers?.refer_physician_name || answers?.physician || '';
        let savedReasonValue = answers?.referral_reason || '';
        try {
          const savedDataRaw = localStorage.getItem('questionnaire');
          if (savedDataRaw) {
            const savedData = JSON.parse(savedDataRaw);
            const a = savedData?.answers || {};
            savedName = a.name || savedName;
            savedEmail = a.email || savedEmail;
            savedPhone = a.phone || savedPhone;
            savedDob = a.dob || savedDob;
            savedReferral = a.refer_physician_name || a.physician || savedReferral;
            savedReasonValue = a.referral_reason || savedReasonValue;
          }
        } catch (e) {
          // ignore parse errors and fall back to redux state
        }

        // Map reason value to label
        let savedReasonLabel = savedReasonValue;
        try {
          const reasonQ = QUESTIONS.find(q => q.id === 'referral_reason');
          if (reasonQ && Array.isArray(reasonQ.options)) {
            const opt = reasonQ.options.find(o => o.value === savedReasonValue);
            if (opt) savedReasonLabel = opt.label;
          }
        } catch {}

        const summaryLines = [
          `Great! I have received your information.`,
          `Full name: ${savedName || 'N/A'}`,
          `Email: ${savedEmail || 'N/A'}`,
          `Phone: ${savedPhone || 'N/A'}`,
          `DOB: ${savedDob || 'N/A'}`,
          `Referral: ${savedReferral || 'N/A'}`,
          `Reason: ${savedReasonLabel || 'N/A'}`,
          ``,
          `Is that correct?`
        ];
        const summaryText = summaryLines.join('\n');
        dispatch(addToChatHistory({
          type: 'bot',
          message: summaryText,
          timestamp: new Date().toISOString(),
          questionId: 'summary-info',
          shouldStream: true,
          options: [
            { value: 'confirm_summary', label: 'Yes, everything is correct' }
          ]
        }));
        // Hide the input while awaiting user confirmation
        setIsAwaitingConfirmation(true);
        // Defer completion until user confirms
      } else {
        // default completion message
        dispatch(addToChatHistory({
          type: 'bot',
          message: "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
          timestamp: new Date().toISOString(),
          questionId: 'completion',
          shouldStream: true
        }));

        // Immediately mark as complete for non-file final step
        dispatch(completeQuestionnaire());
      }
    }, 1500);
    // Note: completion is dispatched above depending on the path
  }
};





  const handleOptionClick = (value, label, questionId) => {
    // Handle special confirmation from summary message
    if (questionId === 'summary-info' && value === 'confirm_summary') {
      const thinkingMessageId = Date.now();
      dispatch(addToChatHistory({
        type: 'bot',
        message: '',
        isTyping: true,
        timestamp: new Date().toISOString(),
        questionId: `thinking-${thinkingMessageId}`
      }));

      setTimeout(() => {
        dispatch(removeToChatHistory(`thinking-${thinkingMessageId}`));
        setIsStreamingActive(true);

        // First completion message
        dispatch(addToChatHistory({
          type: 'bot',
          message: "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
          timestamp: new Date().toISOString(),
          questionId: 'completion',
          shouldStream: true
        }));

        // Follow-up message
        setTimeout(() => {
          // dispatch(addToChatHistory({
          //   type: 'bot',
           
          //   timestamp: new Date().toISOString(),
          //   questionId: 'completion-followup',
          //   shouldStream: true
          // }));

          // Mark as completed and show footer summary area
          dispatch(completeQuestionnaire());
          setIsAwaitingConfirmation(false);
        }, 1200);
      }, 800);
      return;
    }

    // Only process clicks from the current active question
    if (currentQuestion && questionId === currentQuestion.id) {
      handleAnswer(value);
    } else {
      console.log('Ignoring click from previous question:', questionId, 'Current question:', currentQuestion?.id);
    }
  };

  const formatUserAnswer = (question, value) => {
    switch (question.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'select':
        const option = question.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      case 'rating':
        return `${value} star${value !== 1 ? 's' : ''}`;
      case 'scale':
        return `${value}/10`;
      case 'file':
        if (Array.isArray(value)) {
          return value.length > 0 
            ? `Uploaded ${value.length} file${value.length > 1 ? 's' : ''}: ${value.map(f => f.name).join(', ')}`
            : 'No files uploaded';
        }
        return value;
      default:
        return value;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', // Full viewport height
      bgcolor: '#f8f9fa'
    }}>
      {/* Desktop Navbar - always visible on desktop */}
      {!isMobile && <Navbar />}
      
      {/* Chat Container with proper spacing on both sides */}
      <Box sx={{ 
        flex: 1, // Take all remaining space
        display: 'flex', 
        justifyContent: 'center',
        pt: isMobile ? 0 : 1, // Small top padding to avoid navbar overlap
        pb: isMobile ? 0 : 1, // Same bottom padding for symmetry
        overflow: 'hidden' // Prevent any overflow
      }}>
        <Box
          sx={{
            height: '100%', // Full height of parent
            width: '100%',
            maxWidth: isMobile ? '100%' : '800px',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white',
            overflow: 'hidden',
            ...(isMobile ? {} : {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            })
          }}
        >
        {/* Mobile Header - only show on mobile */}
        {isMobile && (
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: 'white',
              color: '#333',
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Toolbar sx={{ minHeight: 56, px: 2 }}>
              <IconButton
                edge="start"
                color="inherit"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Avatar
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 2,
                  bgcolor: '#ff6b35'
                }}
              >
                <Typography variant="caption" color="white" fontWeight="bold">
                  M
                </Typography>
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, color: '#333' }}>
                  Maya - Triage assistant
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Online
                </Typography>
              </Box>
              
              {hasUserStartedMessaging && (
                <Button
                  onClick={handleStartNewChat}
                  size="small"
                  sx={{
                    bgcolor: '#125A67',
                    color: 'white',
                    fontSize: '0.75rem',
                    px: 2,
                    py: 0.5,
                    mr: 1,
                    textTransform: 'none',
                    borderRadius: 20,
                    '&:hover': { bgcolor: '#0d434c' }
                  }}
                >
                  Start New Chat
                </Button>
              )}
              
              <IconButton color="inherit">
                <MoreVertIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {/* Desktop Header - only show on desktop */}
        {!isMobile && (
          <Box
            sx={{
              bgcolor: 'white',
              borderBottom: '1px solid #e0e0e0',
              p: 2,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Avatar
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: '#ff6b35'
                }}
              >
                <Typography variant="body2" color="white" fontWeight="bold">
                  M
                </Typography>
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#333' }}>
                  Maya - Triage assistant
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Please answer the questions below to help us assist you better
                </Typography>
              </Box>

              {hasUserStartedMessaging && (
                <Button
                  onClick={handleStartNewChat}
                  size="small"
                  sx={{
                    bgcolor: '#125A67',
                    color: 'white',
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    borderRadius: 20,
                    '&:hover': { bgcolor: '#0d434c' }
                  }}
                >
                  Start New Chat
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Chat Container */}
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: '#f8f9fa',
            backgroundImage: isMobile ? 'none' : 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex',
            flexDirection: 'column',
            px: isMobile ? 1 : 3,
            py: 2,
            minHeight: 0, // Allow flex shrinking
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#dee2e6',
              borderRadius: '3px',
            },
          }}
        >
          {chatHistory.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message}
              onOptionClick={handleOptionClick}
              onStreamingComplete={handleStreamingComplete}
            />
           
          ))}
        </Box>

        {/* Input Area - hidden while awaiting confirmation */}
        {!isCompleted && currentQuestion && !isAwaitingConfirmation && (
          <Box
            sx={{
              bgcolor: 'white',
              borderTop: '1px solid #e0e0e0',
              p: isMobile ? 1 : 2,
              flexShrink: 0, // Prevent input area from shrinking
              ...(isMobile ? {} : {
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8
              })
            }}
          >
            <ChatInput
              question={currentQuestion}
              currentAnswer={answers[currentQuestion.id]}
              onAnswer={handleAnswer}
              isStreamingActive={isStreamingActive}
            />
          </Box>
        )}

        {/* Completion State */}
        {isCompleted && (
          <Box
            sx={{
              bgcolor: 'white',
              borderTop: '1px solid #e0e0e0',
              p: 3,
              textAlign: 'center',
              flexShrink: 0, // Prevent completion area from shrinking
              ...(isMobile ? {} : {
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8
              })
            }}
          >
            <Typography variant="body1" sx={{ color: '#28a745', fontWeight: 600 }}>
              Thank you for completing the questionnaire!
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
              Our team will review your responses and get back to you soon.
            </Typography>
          </Box>
        )}
        </Box> {/* Close inner chat container Box */}
      </Box> {/* Close outer flex container Box */}

      {/* Desktop Footer - always visible on desktop */}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default ChatbotQuestionnaire;

