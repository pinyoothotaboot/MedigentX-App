
import React from 'react';
import { useAppSelector } from '../store';
import { AlertTriangle, User, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';

const PatientBanner: React.FC = () => {
  const { currentPatient } = useAppSelector(state => state.patients);
  
  if (!currentPatient) {
    return null;
  }

  // Handle various formats of dates and note types for compatibility
  const dob = currentPatient.dateOfBirth || currentPatient.dob || new Date().toISOString();
  const noteTypeDisplay = currentPatient.noteTypePreference || currentPatient.noteType || 'Standard';

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Patient Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-100 dark:bg-medical-900/30 rounded-full flex items-center justify-center">
              <User size={20} className="text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                {currentPatient.name || `${currentPatient.firstName} ${currentPatient.lastName}`}
                <span className="ml-3 text-xs font-normal text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5">
                  {noteTypeDisplay.replace('NOTE_TYPE::', '')}
                </span>
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Hash size={14} className="mr-1" />
                  {currentPatient.mrn || currentPatient.patientId}
                </span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {dob ? format(new Date(dob), 'MMM d, yyyy') : 'N/A'}
                </span>
                <span>{currentPatient.age}y • {currentPatient.gender || currentPatient.sex}</span>
                {currentPatient.weight && (
                  <span>• {currentPatient.weight}kg</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="flex items-center space-x-4">
          {/* Allergies */}
          {currentPatient.allergies && currentPatient.allergies.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">Allergies</span>
              </div>
              <div className="text-xs text-red-700 dark:text-red-400 mt-1 max-w-[200px] truncate">
                {currentPatient.allergies.join(', ')}
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {currentPatient.conditions && currentPatient.conditions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 hidden md:block">
              <div className="flex items-center">
                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Conditions</span>
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 max-w-[200px] truncate">
                {currentPatient.conditions.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientBanner;
