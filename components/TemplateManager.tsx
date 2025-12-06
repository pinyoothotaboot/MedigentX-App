
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addTemplate, updateTemplate, deleteTemplate } from '../store/appSlice';
import { Template } from '../types';
import { Plus, Edit3, Trash2, Save, X, FileText, Stethoscope } from 'lucide-react';
import { Button, Input, Select } from './Button';

const TemplateManager: React.FC = () => {
  const dispatch = useDispatch();
  const templates = useSelector((state: RootState) => state.app.templates);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    type: 'note',
    category: 'Clinical Notes',
    content: {},
    isUserCreated: true
  });

  const categories = [
    'Clinical Notes',
    'Consultation Notes',
    'Discharge Summaries',
    'Progress Notes',
    'Procedure Notes',
    'Follow-up Notes'
  ];

  const noteTypes = [
    { value: 'note', label: 'Medical Note', icon: FileText },
    { value: 'prompt', label: 'Assessment', icon: Stethoscope }
  ];

  const handleCreateTemplate = () => {
    if (formData.name && formData.content) {
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name: formData.name,
        type: formData.type || 'note',
        category: formData.category || 'Clinical Notes',
        content: formData.content as any, // Cast to any to satisfy type check for now
        isUserCreated: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      dispatch(addTemplate(newTemplate));
      resetForm();
    }
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && formData.name && formData.content) {
      const updatedTemplate: Template = {
        ...editingTemplate,
        name: formData.name,
        category: formData.category || editingTemplate.category,
        content: formData.content as any,
        lastModified: new Date().toISOString()
      };
      
      dispatch(updateTemplate(updatedTemplate));
      resetForm();
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      dispatch(deleteTemplate(templateId));
    }
  };

  const startEditing = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      content: template.content
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'note',
      category: 'Clinical Notes',
      content: {},
      isUserCreated: true
    });
  };

  const renderContentFields = () => {
    if (formData.type === 'note') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Structure
            </label>
            <div className="space-y-3">
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
                <div key={section}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {section}
                  </label>
                  <textarea
                    value={(formData.content as any)?.[section.toLowerCase()] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...(prev.content as object || {}),
                        [section.toLowerCase()]: e.target.value
                      }
                    }))}
                    placeholder={`Enter ${section.toLowerCase()} template...`}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-700 dark:text-white rounded-md text-sm resize-none focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Template Content
        </label>
        <textarea
          value={typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content, null, 2)}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            content: e.target.value
          }))}
          placeholder="Enter template content..."
          className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-slate-700 dark:text-white rounded-md resize-none focus:ring-2 focus:ring-medical-500 focus:outline-none"
          rows={8}
        />
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Template Manager</h2>
        <Button
          onClick={() => setIsCreating(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Template
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name..."
            />
            
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Type
            </label>
            <div className="flex gap-2">
              {noteTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormData(prev => ({ ...prev, type: value as 'note' | 'prompt' }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                    ${formData.type === value 
                      ? 'bg-medical-500 text-white border-medical-500' 
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-medical-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {renderContentFields()}

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              className="bg-green-600 hover:bg-green-700"
              icon={<Save className="w-4 h-4" />}
            >
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
            <Button
              variant="secondary"
              onClick={resetForm}
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryTemplates = templates.filter(t => t.category === category);
          if (categoryTemplates.length === 0) return null;
          
          return (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-slate-850">
                {categoryTemplates.map(template => (
                  <div key={template.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                          {template.isUserCreated && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Type: {template.type} • 
                          {template.lastModified && (
                            <span> Modified: {new Date(template.lastModified).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(template)}
                          className="p-2 text-gray-400 hover:text-medical-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {template.isUserCreated && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {templates.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No templates found. Create one to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
