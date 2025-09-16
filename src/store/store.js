import { configureStore } from '@reduxjs/toolkit';
import questionnaireReducer from './questionnaireSlice';

export const store = configureStore({
  reducer: {
    questionnaire: questionnaireReducer,
  },
});
