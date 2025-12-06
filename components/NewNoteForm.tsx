
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentView, addNotification, setCurrentPatientId } from '../store/appSlice';
import { addPatient, setCurrentPatient } from '../store/patientsSlice';
import { clearMessages } from '../store/chatSlice';
import { User, Save, ArrowLeft } from 'lucide-react';
import { Patient, NoteType } from '../types';
import { getNoteTypeOptions, DOCTOR_NOTES } from '../constants/noteTypes';
import { LocalMedicalDB } from '../utils/localMedicalDB';

const NewNoteForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    sex: 'Male' as 'Male' | 'Female' | 'Other',
    weight: '',
    height: '',
    noteType: DOCTOR_NOTES[0] // Default to first note type
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const age = Number(formData.age);
      if (isNaN(age) || age <= 0 || age > 150 || !Number.isInteger(age)) {
        newErrors.age = 'Please enter a valid age (positive integer 1-150)';
      }
    }

    if (formData.weight.trim()) {
        const weight = Number(formData.weight);
        if (isNaN(weight) || weight <= 0) {
            newErrors.weight = 'Valid weight required';
        }
    }

    if (formData.height.trim()) {
        const height = Number(formData.height);
        if (isNaN(height) || height <= 0) {
            newErrors.height = 'Valid height required';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create new patient
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      name: formData.fullName, // Backward compatibility
      firstName,
      lastName,
      dateOfBirth: new Date(new Date().getFullYear() - Number(formData.age), 0, 1).toISOString(),
      dob: new Date(new Date().getFullYear() - Number(formData.age), 0, 1).toISOString(), // Backward compatibility
      patientId: `PAT-${Date.now().toString().slice(-6)}`,
      mrn: `MRN-${Date.now().toString().slice(-8)}`,
      age: Number(formData.age),
      gender: formData.sex as any,
      sex: formData.sex as any,
      weight: formData.weight ? Number(formData.weight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      noteTypePreference: formData.noteType as NoteType,
      noteType: formData.noteType as any,
      allergies: [],
      conditions: [],
      chronicConditions: []
    };

    // Add patient to store
    dispatch(addPatient(newPatient));
    dispatch(setCurrentPatient(newPatient));
    dispatch(setCurrentPatientId(newPatient.id));

    // Save patient to localStorage with user ID
    LocalMedicalDB.savePatient(newPatient, user?.id);

    // Clear any existing chat messages when creating new patient
    dispatch(clearMessages());

    // Show success notification
    dispatch(addNotification({
      type: 'success',
      title: 'Patient Created',
      message: `Patient ${formData.fullName} has been created successfully.`,
      autoRemove: true
    }));

    // Navigate to chat view
    dispatch(setCurrentView('chat'));
  };

  const handleBack = () => {
    dispatch(setCurrentView('welcome'));
  };

  return (
    <div className="flex-1 bg-medical-50 dark:bg-slate-900 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-medical-600 dark:text-gray-400 hover:text-medical-800 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-medical-100 dark:bg-medical-900/30 rounded-lg flex items-center justify-center mr-4">
              <User size={24} className="text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">New Patient Note</h1>
              <p className="text-gray-600 dark:text-gray-400">Enter patient information to start a new note</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter patient's full name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
                errors.fullName 
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Age and Sex */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age *
              </label>
              <input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter age"
                min="1"
                max="150"
                step="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
                  errors.age 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.age}</p>
              )}
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sex *
              </label>
              <select
                id="sex"
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Note Type */}
          <div>
            <label htmlFor="noteType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Note Type *
            </label>
            <select
              id="noteType"
              value={formData.noteType}
              onChange={(e) => handleInputChange('noteType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white"
            >
              {getNoteTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will be the default note type used for all medical notes created for this patient.
            </p>
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight in kg"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weight}</p>
              )}
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Enter height in cm"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors bg-white dark:bg-slate-800 dark:text-white"
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.height}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Save size={20} className="mr-2" />
              Save & Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewNoteForm;
