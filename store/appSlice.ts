
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  autoRemove?: boolean;
}

interface AppState {
  currentView: 'welcome' | 'chat' | 'note' | 'newNote' | 'settings' | 'settings-test' | 'test-soap' | 'final-validation';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  currentPatientId: string | null;
  currentNoteId: string | null;
  notifications: Notification[];
  isLoading: boolean;
  isVoiceRecording: boolean;
  templates: any[]; // Define Template type properly in types.ts
}

const initialState: AppState = {
  currentView: 'welcome',
  sidebarOpen: true,
  theme: 'system',
  currentPatientId: null,
  currentNoteId: null,
  notifications: [],
  isLoading: false,
  isVoiceRecording: false,
  templates: []
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<AppState['currentView']>) => {
      state.currentView = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPatientId: (state, action: PayloadAction<string | null>) => {
      state.currentPatientId = action.payload;
    },
    setCurrentNoteId: (state, action: PayloadAction<string | null>) => {
      state.currentNoteId = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setVoiceRecording: (state, action: PayloadAction<boolean>) => {
      state.isVoiceRecording = action.payload;
    },
    addTemplate: (state, action: PayloadAction<any>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<any>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    }
  }
});

export const { 
  setCurrentView, setSidebarOpen, setCurrentPatientId, setCurrentNoteId, 
  addNotification, removeNotification, setLoading, setVoiceRecording,
  addTemplate, updateTemplate, deleteTemplate
} = appSlice.actions;
export default appSlice.reducer;
