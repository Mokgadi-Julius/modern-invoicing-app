
import React from 'react';
import { TemplateOption, TemplateId } from '../types';

interface TemplateSelectorProps {
  templates: TemplateOption[];
  selectedTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, selectedTemplateId, onSelectTemplate }) => {
  return (
    <div className="mb-3 sm:mb-4 lg:mb-6">
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-sky-400 mb-2 sm:mb-3">Choose Template</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 touch-target
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
