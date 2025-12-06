import React from 'react';
import { SOAPNote } from '../types';
import { FileText, Copy, Download, Share2 } from 'lucide-react';
import { Button } from './Button';

interface SOAPNoteDisplayProps {
  note: SOAPNote | null;
  isLoading: boolean;
}

export const SOAPNoteDisplay: React.FC<SOAPNoteDisplayProps> = ({ note, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mb-4"></div>
        <p>Generating medical documentation...</p>
        <p className="text-sm mt-2">Analyzing clinical context</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50 dark:bg-slate-900/50">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">No Note Selected</h3>
        <p>Select a patient and start a chat to generate documentation.</p>
      </div>
    );
  }

  const sections = [
    { key: 'subjective', label: 'Subjective', color: 'border-l-blue-500' },
    { key: 'objective', label: 'Objective', color: 'border-l-green-500' },
    { key: 'assessment', label: 'Assessment', color: 'border-l-yellow-500' },
    { key: 'plan', label: 'Plan', color: 'border-l-red-500' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-850 shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-medical-600" />
            Medical Note
          </h2>
          <span className="text-xs text-gray-500">
            {new Date(note.date).toLocaleDateString()} • {note.type}
          </span>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" className="h-8 w-8 p-0" title="Copy to Clipboard">
                <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="h-8 w-8 p-0" title="Export PDF">
                <Download className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {sections.map(({ key, label, color }) => (
          <div key={key} className={`pl-4 border-l-4 ${color}`}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              {label}
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {(note as any)[key] || <span className="text-gray-400 italic">No information recorded</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-400">
        MediGentX AI-Generated Documentation • Review required before sign-off
      </div>
    </div>
  );
};