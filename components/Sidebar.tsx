
import React from 'react';
import { PatientManager } from './PatientManager';
import { useAppSelector, useAppDispatch } from '../store';
import { setCurrentPatientId, setCurrentView } from '../store/appSlice';
import { setCurrentNote } from '../store/notesSlice';
import { addPatient, setCurrentPatient } from '../store/patientsSlice';
import { clearMessages } from '../store/chatSlice';
import { Patient } from '../types';

export const Sidebar: React.FC = () => {
  const { patients } = useAppSelector(state => state.patients);
  const { currentPatientId } = useAppSelector(state => state.app);
  const dispatch = useAppDispatch();

  const handleSelectPatient = (patient: Patient) => {
    dispatch(setCurrentPatientId(patient.id));
    dispatch(setCurrentPatient(patient));
    dispatch(setCurrentNote(null));
    dispatch(setCurrentView('chat'));
  };

  const handleAddPatient = (patient: Patient) => {
    dispatch(addPatient(patient));
    // Auto-select the new patient and switch to chat
    dispatch(setCurrentPatient(patient));
    dispatch(setCurrentPatientId(patient.id));
    dispatch(clearMessages());
    dispatch(setCurrentView('chat'));
  };

  return (
    <PatientManager 
      patients={patients}
      selectedPatientId={currentPatientId}
      onSelectPatient={handleSelectPatient}
      onAddPatient={handleAddPatient}
    />
  );
};
