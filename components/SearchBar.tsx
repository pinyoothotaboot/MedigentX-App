
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentPatientId, setCurrentView } from '../store/appSlice';
import { setCurrentPatient } from '../store/patientsSlice';

interface SearchBarProps {
  onResultSelect?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { patients } = useAppSelector(state => state.patients);
  const dispatch = useAppDispatch();

  const filteredPatients = searchTerm 
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.mrn.includes(searchTerm)
      )
    : [];

  const handleSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        dispatch(setCurrentPatientId(patient.id));
        dispatch(setCurrentPatient(patient));
        dispatch(setCurrentView('chat'));
    }
    setSearchTerm('');
    if (onResultSelect) onResultSelect();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input 
          type="text"
          placeholder="Search patients by name or MRN..." 
          className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-medical-500 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">MRN: {patient.mrn} • {patient.gender} • {patient.age}y</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No patients found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
