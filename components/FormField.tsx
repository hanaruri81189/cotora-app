
import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholderExample: string;
  isTextarea?: boolean;
  isOptional?: boolean;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({ 
  id,
  label, 
  value, 
  onChange, 
  placeholderExample, 
  isTextarea = false, 
  isOptional = false,
  rows = 3
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isOptional ? (
          <span className="text-xs text-gray-500 ml-1">(任意)</span>
        ) : (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <p className="text-xs text-gray-500 mb-1.5">{placeholderExample}</p>
      {isTextarea ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type="text"
          id={id}
          name={id}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default FormField;