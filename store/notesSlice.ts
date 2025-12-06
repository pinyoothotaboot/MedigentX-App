
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note } from '../types';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload);
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
        if (state.currentNote?.id === action.payload.id) {
          state.currentNote = action.payload;
        }
      }
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    saveDraft: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      } else {
        state.notes.unshift(action.payload);
      }
    }
  }
});

export const { setNotes, addNote, updateNote, setCurrentNote, saveDraft } = notesSlice.actions;
export default notesSlice.reducer;