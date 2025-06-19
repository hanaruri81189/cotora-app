
import React from 'react';
import { SelectOption } from '../types';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  isOptional?: boolean;
  helpText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  id,
  label, 
  value, 
  onChange, 
  options, 
  isOptional = false,
  helpText
}) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isOptional ? (
          <span className="text-xs text-gray-500 ml-1">(任意)</span>
        ) : (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <select
        id={id}
        name={id}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
        value={value}
        onChange={onChange}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1.5 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default SelectField;