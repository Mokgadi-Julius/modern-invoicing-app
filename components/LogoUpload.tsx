
import React, { useState, useRef } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';
import { defaultLogoPlaceholder } from '../constants';


interface LogoUploadProps {
  onLogoChange: (file: File | null) => void;
  currentLogo: string | null; // This will be a data URL
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, currentLogo }) => {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File is too large. Please select an image under 2MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        alert("Invalid file type. Please select a JPG, PNG, GIF, or SVG image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onLogoChange(file);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user cancels dialog), do nothing or reset
      // setPreview(null); 
      // onLogoChange(null);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayPreview = preview || defaultLogoPlaceholder;

  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed border-slate-600 rounded-lg bg-slate-700/50">
      <div className="w-48 h-24 bg-slate-600 rounded flex items-center justify-center overflow-hidden">
        {displayPreview ? (
          <img src={displayPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-slate-400 text-sm">Logo Preview</span>
        )}
      </div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/gif, image/svg+xml"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={triggerFileInput}
          className="flex items-center px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-md hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          {preview ? 'Change Logo' : 'Upload Logo'}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Remove logo"
          >
            <XCircleIcon className="w-4 h-4 mr-2" />
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">Max 2MB. PNG, JPG, GIF, SVG.</p>
    </div>
  );
};
