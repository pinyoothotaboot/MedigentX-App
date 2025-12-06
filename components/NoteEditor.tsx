
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateNote, addNote, saveDraft, setCurrentNote } from '../store/notesSlice';
import { addNotification } from '../store/appSlice';
import { Save, FileText, Download, Printer, Share } from 'lucide-react';
import { Note, NoteType } from '../types';
import { getNoteTypeOptions } from '../constants/noteTypes';

const NoteEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentNote } = useAppSelector(state => state.notes);
  const { currentPatient } = useAppSelector(state => state.patients);
  
  const [noteData, setNoteData] = useState<Partial<Note>>({
    title: '',
    type: 'SOAP',
    noteType: currentPatient?.noteTypePreference || NoteType.StandardSOAP,
    content: {},
    isDraft: true,
    isLocalOnly: true,
  });

  useEffect(() => {
    if (currentNote) {
      setNoteData(currentNote);
    } else {
      setNoteData({
        title: '',
        type: 'SOAP',
        noteType: currentPatient?.noteTypePreference || NoteType.StandardSOAP,
        content: {},
        isDraft: true,
        isLocalOnly: true,
      });
    }
  }, [currentNote, currentPatient]);

  const updateNoteContent = (field: string, value: string) => {
    setNoteData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const saveDraftNote = () => {
    if (!currentPatient) return;

    const draftNote: Note = {
      id: currentNote?.id || Date.now().toString(),
      patientId: currentPatient.id,
      title: noteData.title || `SOAP Note - ${new Date().toLocaleDateString()}`,
      type: noteData.type || 'SOAP',
      noteType: noteData.noteType,
      content: noteData.content || {},
      createdAt: currentNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      isDraft: true,
      isLocalOnly: true,
    };

    dispatch(saveDraft(draftNote));
    dispatch(setCurrentNote(draftNote));
    dispatch(addNotification({ type: 'success', message: 'Draft saved' }));
  };

  if (!currentPatient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>Select a patient to create a note</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-900 flex flex-col h-full">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note Title..."
              className="text-xl font-bold bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
            />
            {noteData.isDraft && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Draft</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraftNote} className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors">
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 max-w-4xl mx-auto">
          {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
            <div key={section} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">{section}</h3>
              <textarea
                value={(noteData.content as any)?.[section.toLowerCase()] || ''}
                onChange={(e) => updateNoteContent(section.toLowerCase(), e.target.value)}
                className="w-full min-h-[120px] p-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                placeholder={`Enter ${section}...`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
