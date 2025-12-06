
import { NoteType } from '../types';

export const DOCTOR_NOTES = Object.values(NoteType);

export const getNoteTypeOptions = () => 
  DOCTOR_NOTES.map(type => ({
    value: type,
    label: type.replace(/([A-Z])/g, ' $1').trim() // Simple camelCase to Space
  }));
