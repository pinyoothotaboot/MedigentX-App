import React, { useState, useEffect } from 'react';
import { User, Patient, SOAPNote, NoteType } from './types';
import { PatientManager } from './components/PatientManager';
import { ChatInterface } from './components/ChatInterface';
import { SOAPNoteDisplay } from './components/SOAPNoteDisplay';
import { Activity, LogOut, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Button, Input } from './components/Button';

// Mock Initial Data
const INITIAL_PATIENTS: Patient[] = [
  { id: '1', mrn: 'MRN-2023-001', name: 'John Doe', age: 45, gender: 'Male', dob: '1979-05-15', noteTypePreference: NoteType.StandardSOAP, allergies: ['Penicillin'], conditions: ['Hypertension'] },
  { id: '2', mrn: 'MRN-2023-042', name: 'Sarah Smith', age: 32, gender: 'Female', dob: '1992-08-22', noteTypePreference: NoteType.Psychiatry, allergies: [], conditions: ['Anxiety'] },
  { id: '3', mrn: 'MRN-2023-089', name: 'Robert Johnson', age: 68, gender: 'Male', dob: '1956-01-10', noteTypePreference: NoteType.Operative, allergies: ['Sulfa'], conditions: ['T2DM', 'CAD'] },
];

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('demo@medigentx.com');
  const [password, setPassword] = useState('demo123');
  const [authError, setAuthError] = useState('');

  // App State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<SOAPNote | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Dark Mode
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Load User Data on Login
  useEffect(() => {
    if (user) {
        // Load patients specific to this user from localStorage
        const savedPatients = localStorage.getItem(`medigentx_patients_${user.id}`);
        if (savedPatients) {
            setPatients(JSON.parse(savedPatients));
        } else {
            setPatients(INITIAL_PATIENTS);
            localStorage.setItem(`medigentx_patients_${user.id}`, JSON.stringify(INITIAL_PATIENTS));
        }
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'demo@medigentx.com' && password === 'demo123') {
      setUser({
        id: 'user_demo_123',
        email,
        name: 'Dr. Alexander Fleming',
        license: 'MD-55442',
        role: 'doctor'
      });
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Try demo@medigentx.com / demo123');
    }
  };

  const handleAddPatient = (patient: Patient) => {
    if (!user) return;
    const updated = [patient, ...patients];
    setPatients(updated);
    localStorage.setItem(`medigentx_patients_${user.id}`, JSON.stringify(updated));
    setSelectedPatientId(patient.id);
  };

  const handleUpdateNoteFromChat = (text: string) => {
    if (!selectedPatientId) return;
    
    // Simple parser for demonstration
    // In a real app, this would be more robust regex
    const parseSection = (header: string) => {
      const regex = new RegExp(`# ${header}[\\s\\S]*?(?=(# |$))`, 'i');
      const match = text.match(regex);
      return match ? match[0].replace(`# ${header}`, '').trim() : '';
    };

    const newNote: SOAPNote = {
      id: currentNote?.id || crypto.randomUUID(),
      patientId: selectedPatientId,
      date: new Date().toISOString(),
      type: patients.find(p => p.id === selectedPatientId)?.noteTypePreference || NoteType.StandardSOAP,
      subjective: parseSection('Subjective') || parseSection('History'),
      objective: parseSection('Objective') || parseSection('Physical Exam'),
      assessment: parseSection('Assessment') || parseSection('Diagnosis'),
      plan: parseSection('Plan') || parseSection('Treatment'),
      isDraft: true
    };
    
    setCurrentNote(newNote);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-medical-50 dark:bg-medical-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-medical-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MediGentX Web</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">AI-Powered Medical Documentation</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="demo@medigentx.com"
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="demo123"
            />
            {authError && (
              <div className="text-red-500 text-sm flex items-center bg-red-50 p-2 rounded">
                <ShieldCheck className="w-4 h-4 mr-1" />
                {authError}
              </div>
            )}
            <Button className="w-full h-11 text-base shadow-lg shadow-medical-500/20">
                Secure Login
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            Protected by Enterprise Grade Security • HIPAA Compliant
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Navbar */}
      <header className="h-16 bg-white dark:bg-slate-850 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="bg-medical-600 rounded-lg p-1.5">
                <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                MediGentX <span className="text-medical-500 font-light">Web</span>
            </span>
            <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">
                PRODUCTION READY
            </span>
        </div>
        
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleTheme} className="rounded-full w-10 h-10 p-0">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.license}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-medical-100 dark:bg-medical-900 flex items-center justify-center text-medical-700 dark:text-medical-300 font-bold text-xs">
                    DR
                </div>
                <Button variant="ghost" onClick={() => setUser(null)} title="Logout">
                    <LogOut className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </Button>
            </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Patients */}
        <PatientManager 
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(p) => {
                setSelectedPatientId(p.id);
                setCurrentNote(null); // Reset note when switching patients
            }}
            onAddPatient={handleAddPatient}
        />

        {/* Center: Chat & Note Split */}
        <main className="flex-1 flex overflow-hidden relative">
            {selectedPatient ? (
                <>
                    {/* Chat Area - 45% Width */}
                    <div className="w-[45%] border-r border-gray-200 dark:border-gray-700 flex flex-col min-w-[350px]">
                        <ChatInterface 
                            patient={selectedPatient}
                            onUpdateNote={handleUpdateNoteFromChat}
                            userId={user.id}
                        />
                    </div>
                    
                    {/* Note Area - 55% Width */}
                    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900">
                        <SOAPNoteDisplay 
                            note={currentNote}
                            isLoading={isNoteLoading}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-900">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-full shadow-lg mb-6">
                        <Activity className="w-16 h-16 text-medical-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to MediGentX</h2>
                    <p className="max-w-md text-center">Select a patient from the sidebar or create a new one to begin generating AI-powered documentation.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;