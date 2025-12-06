
import React, { useState } from 'react';
import { Patient, NoteType } from '../types';
import { User, Search, Plus, UserPlus } from 'lucide-react';
import { Button, Input, Select } from './Button';

interface PatientManagerProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
}

// Utility to generate UUID safely
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const PatientManager: React.FC<PatientManagerProps> = ({ 
  patients, 
  selectedPatientId, 
  onSelectPatient,
  onAddPatient
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    noteTypePreference: NoteType.StandardSOAP,
    gender: 'Male'
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.includes(searchTerm)
  );

  const handleSave = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.mrn) return;
    
    const patient: Patient = {
      id: generateId(),
      name: newPatient.name,
      age: Number(newPatient.age),
      mrn: newPatient.mrn,
      gender: newPatient.gender as any,
      dob: newPatient.dob || new Date().toISOString().split('T')[0],
      noteTypePreference: newPatient.noteTypePreference as NoteType,
      allergies: [],
      conditions: [],
      lastVisit: new Date().toISOString()
    };
    
    onAddPatient(patient);
    setIsAdding(false);
    setNewPatient({ noteTypePreference: NoteType.StandardSOAP, gender: 'Male' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-850 border-r border-gray-200 dark:border-gray-700 w-80">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-medical-500" />
          Patients
        </h2>
        
        {!isAdding ? (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search name or MRN..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => setIsAdding(true)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              New Patient
            </Button>
          </>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
            <Input 
              placeholder="Name" 
              value={newPatient.name || ''} 
              onChange={e => setNewPatient({...newPatient, name: e.target.value})}
              autoFocus
            />
            <div className="flex gap-2">
              <Input 
                placeholder="Age" 
                type="number"
                className="w-20"
                value={newPatient.age || ''} 
                onChange={e => setNewPatient({...newPatient, age: Number(e.target.value)})}
              />
              <Select 
                value={newPatient.gender}
                onChange={e => setNewPatient({...newPatient, gender: e.target.value as any})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <Input 
              placeholder="MRN (e.g. 12345)" 
              value={newPatient.mrn || ''} 
              onChange={e => setNewPatient({...newPatient, mrn: e.target.value})}
            />
            <Select 
              label="Note Type Preference"
              value={newPatient.noteTypePreference}
              onChange={e => setNewPatient({...newPatient, noteTypePreference: e.target.value as NoteType})}
            >
              {Object.values(NoteType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave}>Save</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredPatients.map(patient => (
          <div 
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className={`p-4 cursor-pointer border-l-4 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 ${
              selectedPatientId === patient.id 
                ? 'border-medical-500 bg-medical-50 dark:bg-slate-800' 
                : 'border-transparent'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">MRN: {patient.mrn} • {patient.age}y • {patient.gender}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                {patient.noteTypePreference.replace('SOAP', '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
