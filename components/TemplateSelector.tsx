
import React from 'react';
import { TemplateOption, TemplateId } from '../types';

interface TemplateSelectorProps {
  templates: TemplateOption[];
  selectedTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, selectedTemplateId, onSelectTemplate }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-sky-400 mb-3">Choose Template</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
              ${selectedTemplateId === template.id 
                ? 'bg-sky-500 border-sky-500 text-white shadow-lg transform scale-105' 
                : 'bg-slate-700 border-slate-600 text-sky-300 hover:border-sky-500 hover:bg-slate-600'
              }`}
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
};
