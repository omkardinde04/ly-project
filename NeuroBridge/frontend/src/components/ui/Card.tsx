import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  )
}
