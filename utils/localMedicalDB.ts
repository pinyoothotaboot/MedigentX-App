
import { Patient } from '../types';

export const LocalMedicalDB = {
  savePatient: (patient: Patient, userId?: string) => {
    if (!userId) return;
    const key = `medigentx_patients_${userId}`;
    const existing = localStorage.getItem(key);
    const patients = existing ? JSON.parse(existing) : [];
    
    // Check if patient exists
    const index = patients.findIndex((p: Patient) => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.unshift(patient);
    }
    
    localStorage.setItem(key, JSON.stringify(patients));
  },
  
  getPatients: (userId?: string): Patient[] => {
    if (!userId) return [];
    const key = `medigentx_patients_${userId}`;
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  }
};
