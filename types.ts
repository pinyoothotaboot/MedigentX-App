export interface User {
  id: string;
  email: string;
  name: string;
  license: string;
  role: 'doctor' | 'admin';
}

export enum NoteType {
  StandardSOAP = 'StandardSOAP',
  SOAPList = 'SOAPList',
  Psychiatry = 'Psychiatry',
  Comprehensive = 'Comprehensive',
  Operative = 'Operative'
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  noteTypePreference: NoteType;
  allergies: string[];
  conditions: string[];
  lastVisit?: string;
}

export interface SOAPNote {
  id: string;
  patientId: string;
  date: string;
  type: NoteType;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isDraft: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface StreamChunk {
  text?: string;
  done: boolean;
  heartbeat?: boolean;
}