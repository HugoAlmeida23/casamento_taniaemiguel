import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'md' 
}) => {
  const variants = {
    success: 'bg-green-100 text-green-700 ring-green-600/20',
    warning: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
    danger: 'bg-red-100 text-red-700 ring-red-600/20',
    info: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    default: 'bg-gray-100 text-gray-700 ring-gray-600/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-medium ring-1 ring-inset ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
