
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient } from '../types';

interface PatientsState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setPatients: (state, action: PayloadAction<Patient[]>) => {
      state.patients = action.payload;
    },
    addPatient: (state, action: PayloadAction<Patient>) => {
      state.patients.unshift(action.payload);
    },
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const index = state.patients.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
        if (state.currentPatient?.id === action.payload.id) {
          state.currentPatient = action.payload;
        }
      }
    },
    deletePatient: (state, action: PayloadAction<string>) => {
      state.patients = state.patients.filter(p => p.id !== action.payload);
      if (state.currentPatient?.id === action.payload) {
        state.currentPatient = null;
      }
    },
    setCurrentPatient: (state, action: PayloadAction<Patient | null>) => {
      state.currentPatient = action.payload;
    }
  }
});

export const { setPatients, addPatient, updatePatient, deletePatient, setCurrentPatient } = patientsSlice.actions;
export default patientsSlice.reducer;
