import React, { useState, useRef } from 'react';
import { UploadCloudIcon } from './Icon';

interface FileUploadInputProps {
    id: string;
    label: string;
    onFileSelect: (file: File) => void;
    required?: boolean;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ id, label, onFileSelect, required }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-stone-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div 
                onClick={handleButtonClick}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-600 border-dashed rounded-md cursor-pointer hover:border-orange-500 transition-colors"
            >
                <div className="space-y-1 text-center">
                    <UploadCloudIcon className="mx-auto h-12 w-12 text-stone-400" />
                    <div className="flex text-sm text-stone-400">
                        <p className="pl-1">
                           {fileName ? (
                               <span className="font-semibold text-green-400">{fileName}</span>
                           ) : (
                               <>
                                <span className="font-semibold text-orange-400">Upload a file</span> or take a photo
                               </>
                           )}
                        </p>
                        <input 
                            id={id} 
                            ref={inputRef}
                            name={id} 
                            type="file" 
                            className="sr-only" 
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                        />
                    </div>
                    <p className="text-xs text-stone-500">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
        </div>
    );
};

export default FileUploadInput;