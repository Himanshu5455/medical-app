import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import ChatHeader from "../components/chat/ChatHeader";
import Completion from "../components/chat/Completion";
import {
  CHATBOT_FLOW_STEP2_QUESTIONS,
  getVisibleFlowQuestions,
  getNextQuestion,
  isFlowComplete
} from "../data/chatbotFlowQuestions";
import { QUESTIONS } from "../data/questions";
import { withTyping } from "../utils/chatHelpers";
import {
  setAnswer,
  addToChatHistory,
  nextQuestion,
  completeQuestionnaire,
  resetQuestionnaire,
  setCurrentQuestion,
} from "../store/questionnaireSlice";

const ChatbotFlow = () => {
  const [welcomeStreamed, setWelcomeStreamed] = useState(false);
  const [currentStep, setCurrentStep] = useState(2); // Start from Step 2
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { currentQuestionIndex: reduxQuestionIndex, answers, chatHistory, isCompleted } =
    useSelector((state) => state.questionnaire);

  const chatContainerRef = useRef(null);
  const initializedRef = useRef(false);

  // Get current question - use existing questions first, then new flow
  const getCurrentQuestion = () => {
    // If we have name but no phone, show phone question
    if (answers.name && !answers.phone) {
      return QUESTIONS.find(q => q.id === 'phone');
    }
    // If we have phone but no consent, show consent question
    if (answers.phone && answers.consent_info === undefined) {
      return QUESTIONS.find(q => q.id === 'consent_info');
    }
    // If consent is false, we're done
    if (answers.consent_info === false) {
      return null;
    }
    // If consent is true but no referral check, show referral question
    if (answers.consent_info === true && !answers.referral_check) {
      return CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === 'referral_check');
    }
    // If we have referral but no demographics dob, start demographics
    if (answers.referral_check && !answers.demographics_dob) {
      return CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === 'demographics_dob');
    }
    // Continue with demographics flow - check which question is next
    if (answers.demographics_dob) {
      const demographicsQuestions = [
        'demographics_dob', 
        'demographics_health_card',
        'demographics_sex_assigned_at_birth',
        'demographics_email',
        'demographics_address',
        'demographics_phone'
      ];
      
      // Find the next unanswered question
      for (let i = 0; i < demographicsQuestions.length; i++) {
        const questionId = demographicsQuestions[i];
        if (!answers[questionId]) {
          return CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === questionId);
        }
      }
      // All demographics questions answered
      return null;
    }
    // Default to name question
    return QUESTIONS.find(q => q.id === 'name');
  };

  const currentQuestion = getCurrentQuestion();

  // Handler for when streaming completes
  const handleStreamingComplete = () => {
    setIsStreamingActive(false);
    if (!welcomeStreamed && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.questionId === "welcome" && chatHistory.length === 1) {
        setWelcomeStreamed(true);
        setIsStreamingActive(true);
        const firstQuestion = QUESTIONS.find(q => q.id === 'name');
        if (firstQuestion) {
          const messageData = {
            type: "bot",
            message: firstQuestion.question,
            timestamp: new Date().toISOString(),
            questionId: firstQuestion.id,
            shouldStream: true,
          };
          dispatch(addToChatHistory(messageData));
        }
      }
    }
  };

  // Check if user has started messaging (answered at least one question)
  const hasUserStartedMessaging = Object.values(answers).some(
    (value) =>
      value !== "" &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0)
  );

  // Reset chat function
  const handleStartNewChat = () => {
    dispatch(resetQuestionnaire());
    localStorage.removeItem("questionnaire");
    setCurrentStep(2);
    setCurrentQuestionIndex(0);
    setIsAwaitingConfirmation(false);
    setWelcomeStreamed(false);
    initializedRef.current = false;
    
    // Start with same welcome as existing questionnaire
    setTimeout(() => {
      setIsStreamingActive(true);
      dispatch(
        addToChatHistory({
          type: "bot",
          message: "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
          timestamp: new Date().toISOString(),
          questionId: "welcome",
          shouldStream: true,
        })
      );
    }, 500);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Initialize chat on first mount - start with same welcome as existing questionnaire
  useEffect(() => {
    if (initializedRef.current) return;
    
    setIsStreamingActive(true);
    dispatch(
      addToChatHistory({
        type: "bot",
        message: "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
        timestamp: new Date().toISOString(),
        questionId: "welcome",
        shouldStream: true,
      })
    );
    initializedRef.current = true;
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      currentQuestionIndex,
      answers,
      chatHistory,
      isCompleted,
    };
    localStorage.setItem("questionnaire", JSON.stringify(dataToSave));
  }, [currentQuestionIndex, answers, chatHistory, isCompleted]);

  const handleAnswer = (value) => {
    const question = currentQuestion;
    if (!question) return;

    // Add user message
    dispatch(
      addToChatHistory({
        type: "user",
        message: formatUserAnswer(question, value),
        timestamp: new Date().toISOString(),
        questionId: question.id,
      })
    );

    // Save answer
    dispatch(
      setAnswer({
        field: question.id,
        value: value,
      })
    );

    // Handle name question - move to phone
    if (question.id === 'name') {
      const phoneQuestion = QUESTIONS.find(q => q.id === 'phone');
      if (phoneQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: phoneQuestion.question,
              timestamp: new Date().toISOString(),
              questionId: phoneQuestion.id,
              shouldStream: true,
            })
          );
        });
      }
      return;
    }

    // Handle phone question - move to consent
    if (question.id === 'phone') {
      const consentQuestion = QUESTIONS.find(q => q.id === 'consent_info');
      if (consentQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: consentQuestion.question({ ...answers, [question.id]: value }),
              timestamp: new Date().toISOString(),
              questionId: consentQuestion.id,
              shouldStream: true,
              showBooleanOptions: true,
            })
          );
        });
      }
      return;
    }

    // Handle consent response
    if (question.id === 'consent_info' && value === false) {
      // User declined consent - show escalation message
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
        dispatch(
          addToChatHistory({
            type: "bot",
            message: "If you don't feel comfortable sharing your information with me, we'll refer you to one of our specialists to get in touch with you.",
            timestamp: new Date().toISOString(),
            questionId: "consent-declined",
            shouldStream: true,
          })
        );
        dispatch(completeQuestionnaire());
      });
      return;
    }

    // Handle consent accepted - move to new flow
    if (question.id === 'consent_info' && value === true) {
      const referralQuestion = CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === 'referral_check');
      if (referralQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: referralQuestion.question,
              timestamp: new Date().toISOString(),
              questionId: referralQuestion.id,
              shouldStream: true,
              options: referralQuestion.options,
            })
          );
        });
      }
      return;
    }

    // Handle referral check - all paths lead directly to demographics collection
    if (question.id === 'referral_check') {
      // All paths lead directly to demographics collection - start with Date of Birth
      const dobQuestion = CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === 'demographics_dob');
      if (dobQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: dobQuestion.question,
              timestamp: new Date().toISOString(),
              questionId: dobQuestion.id,
              shouldStream: true,
            })
          );
        });
      }
      return;
    }

    // Handle demographics flow progression
    if (question.id.startsWith('demographics_')) {
      const demographicsQuestions = [
        'demographics_dob', 
        'demographics_health_card',
        'demographics_sex_assigned_at_birth',
        'demographics_email',
        'demographics_address',
        'demographics_phone'
      ];
      
      const currentIndex = demographicsQuestions.indexOf(question.id);
      const nextQuestionId = demographicsQuestions[currentIndex + 1];
      
      if (nextQuestionId) {
        const nextQ = CHATBOT_FLOW_STEP2_QUESTIONS.find(q => q.id === nextQuestionId);
        if (nextQ) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            const messageData = {
              type: "bot",
              message: typeof nextQ.question === 'function' ? nextQ.question({ ...answers, [question.id]: value }) : nextQ.question,
              timestamp: new Date().toISOString(),
              questionId: nextQ.id,
              shouldStream: true,
            };

            if (nextQ.type === "select" && nextQ.options) {
              messageData.options = nextQ.options;
            }

            dispatch(addToChatHistory(messageData));
          });
        }
      } else {
        // Demographics complete
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
              timestamp: new Date().toISOString(),
              questionId: "completion",
              shouldStream: true,
            })
          );
          dispatch(completeQuestionnaire());
        });
      }
      return;
    }

    // Get next question from new flow
    const nextQ = getNextQuestion(question.id, { ...answers, [question.id]: value });
    
    if (nextQ) {
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
        const messageData = {
          type: "bot",
          message: nextQ.question,
          timestamp: new Date().toISOString(),
          questionId: nextQ.id,
          shouldStream: true,
        };

        if (nextQ.type === "select" && nextQ.options) {
          messageData.options = nextQ.options;
        } else if (nextQ.type === "consent") {
          messageData.options = nextQ.options;
        }

        dispatch(addToChatHistory(messageData));
        setCurrentQuestionIndex(prev => prev + 1);
      });
    } else {
      // No next question - check if flow is complete
      const updatedAnswers = { ...answers, [question.id]: value };
      if (isFlowComplete(updatedAnswers)) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
              timestamp: new Date().toISOString(),
              questionId: "completion",
              shouldStream: true,
            })
          );
          dispatch(completeQuestionnaire());
        });
      }
    }
  };

  const handleOptionClick = (value, label, questionId) => {
    // Only process clicks from the current active question
    if (currentQuestion && questionId === currentQuestion.id) {
      handleAnswer(value);
    } else {
      console.log(
        "Ignoring click from previous question:",
        questionId,
        "Current question:",
        currentQuestion?.id
      );
    }
  };

  // Format user answer for display
  const formatUserAnswer = (question, value) => {
    if (question.type === "select" || question.type === "consent") {
      const option = question.options?.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    if (question.type === "boolean") {
      return value ? "Yes" : "No";
    }
    return value;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#f8f9fa",
      }}
    >
      {/* Desktop Navbar - always visible on desktop */}
      {!isMobile && <Navbar />}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          pt: isMobile ? 0 : 1,
          pb: isMobile ? 0 : 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            maxWidth: isMobile ? "100%" : "800px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            overflow: "hidden",
            ...(isMobile
              ? {}
              : {
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }),
          }}
        >
          {/* Header */}
          <ChatHeader
            isMobile={isMobile}
            hasUserStartedMessaging={hasUserStartedMessaging}
            onStartNewChat={handleStartNewChat}
          />

          {/* Chat Container */}
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: "#f8f9fa",
              backgroundImage: isMobile
                ? "none"
                : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
              display: "flex",
              flexDirection: "column",
              px: isMobile ? 1 : 3,
              py: 2,
              minHeight: 0,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#dee2e6",
                borderRadius: "3px",
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

          {/* Input Area - hidden while awaiting confirmation or completed */}
          {!isCompleted && currentQuestion && !isAwaitingConfirmation && (
            <Box
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e0e0e0",
                p: isMobile ? 1 : 2,
                flexShrink: 0,
                ...(isMobile
                  ? {}
                  : {
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                    }),
              }}
            >
              <ChatInput
                question={currentQuestion}
                currentAnswer={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
                isStreamingActive={isStreamingActive}
                filesPermission={false}
                isEditing={false}
              />
            </Box>
          )}

          {/* Completion State */}
          {isCompleted && <Completion isMobile={isMobile} />}
        </Box>
      </Box>
      {/* Desktop Footer - always visible on desktop */}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default ChatbotFlow;
