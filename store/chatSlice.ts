
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, SOAPNote } from '../types';

interface ChatState {
  messages: ChatMessage[];
  soapNotes: SOAPNote[];
  isTyping: boolean;
  selectedLLMProvider: string;
  selectedLLMModel: string;
  selectedLanguage: string;
}

const initialState: ChatState = {
  messages: [],
  soapNotes: [],
  isTyping: false,
  selectedLLMProvider: 'gemini',
  selectedLLMModel: 'gemini-2.5-flash',
  selectedLanguage: 'en'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setSOAPNotes: (state, action: PayloadAction<SOAPNote[]>) => {
      state.soapNotes = action.payload;
    },
    addSOAPNote: (state, action: PayloadAction<SOAPNote>) => {
      state.soapNotes.unshift(action.payload);
    },
    updateSOAPNote: (state, action: PayloadAction<SOAPNote>) => {
      const index = state.soapNotes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.soapNotes[index] = action.payload;
      }
    },
    setSelectedLLMProvider: (state, action: PayloadAction<{provider: string, model: string}>) => {
      state.selectedLLMProvider = action.payload.provider;
      state.selectedLLMModel = action.payload.model;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    updateMessageAction: (state, action: PayloadAction<{messageId: string, actionType: string, performed: boolean}>) => {
      // Mock implementation for actions like copy, thumbs up
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  }
});

export const { 
  setMessages, addMessage, setTyping, setSOAPNotes, addSOAPNote, updateSOAPNote,
  setSelectedLLMProvider, setSelectedLanguage, updateMessageAction, clearMessages 
} = chatSlice.actions;
export default chatSlice.reducer;