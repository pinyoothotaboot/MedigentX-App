
import React from 'react';
import { PatientManager } from './PatientManager';
import { useAppSelector, useAppDispatch } from '../store';
import { setCurrentPatientId } from '../store/appSlice';
import { setCurrentNote } from '../store/notesSlice';
import { addPatient } from '../store/patientsSlice';
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
    dispatch(addPatient(patient));
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
