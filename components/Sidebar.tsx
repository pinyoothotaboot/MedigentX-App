import React from 'react';
import { PatientManager } from './PatientManager';
import { useAppSelector, useAppDispatch } from '../store';
import { setCurrentPatientId } from '../store/appSlice';
import { setCurrentNote } from '../store/notesSlice';
import { Patient } from '../types';

export const Sidebar: React.FC = () => {
  const { patients } = useAppSelector(state => state.patients);
  const { currentPatientId } = useAppSelector(state => state.app);
  const dispatch = useAppDispatch();

  const handleSelectPatient = (patient: Patient) => {
    dispatch(setCurrentPatientId(patient.id));
    dispatch(setCurrentNote(null));
  };

  const handleAddPatient = (patient: Patient) => {
    // Logic usually handled in PatientManager, but if we need Redux dispatch here:
    // dispatch(addPatient(patient));
    // For now PatientManager handles the callback locally or via its own props
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