import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-surface overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-border bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-text">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  )
}
