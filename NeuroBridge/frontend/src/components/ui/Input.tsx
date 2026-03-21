import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          {...props}
          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
        />
      </div>
    </div>
  )
}
