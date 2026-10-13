import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded-lg font-medium text-sm transition duration-150 disabled:opacity-50";
  const styles = variant === 'primary' 
    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
    : "bg-slate-200 hover:bg-slate-300 text-slate-800";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}