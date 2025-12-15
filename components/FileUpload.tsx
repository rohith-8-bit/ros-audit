import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
          ${selectedFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".zip,.tar,.gz,.py,.cpp"
          onChange={handleChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-fade-in text-green-700 dark:text-green-400">
            <CheckCircle className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">{selectedFile.name}</p>
            <p className="text-sm mt-2 opacity-75">
              {(selectedFile.size / 1024).toFixed(2)} KB • Ready for Analysis
            </p>
            <button 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium z-10"
            >
                Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
            <Upload className={`w-12 h-12 mb-4 transition-transform duration-300 ${dragActive ? 'scale-110 text-blue-500' : ''}`} />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
              Drag & drop your ROS package
            </p>
            <p className="text-sm mt-2 text-slate-400 dark:text-slate-500">
              Supported: .zip, .py, .cpp
            </p>
            <div className="mt-6 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              Browse Files
            </div>
          </div>
        )}
      </div>
      
      {/* Helper text for the assignment demo */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-900/50">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Demo Tip:</strong> Upload a file named "pick_and_place.zip" for a PASS result, or "faulty_package.zip" to see validation errors.
        </p>
      </div>
    </div>
  );
};