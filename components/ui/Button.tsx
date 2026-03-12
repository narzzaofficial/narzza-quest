'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    // Ubah rounded-full menjadi rounded-xl agar senada dengan input box
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border';

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    };

    let variantClasses = '';
    switch (variant) {
        case 'primary':
            // Gradasi ungu ke pink
            variantClasses = 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent hover:shadow-[0_8px_25px_rgba(168,85,247,0.3)] hover:-translate-y-0.5';
            break;
        case 'secondary':
            // Ungu pastel
            variantClasses = 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200';
            break;
        case 'outline':
            // Garis luar ungu
            variantClasses = 'bg-transparent text-purple-600 border-purple-200 hover:border-purple-400 hover:bg-purple-50';
            break;
        case 'ghost':
            // Transparan
            variantClasses = 'bg-transparent text-slate-500 border-transparent hover:text-purple-600 hover:bg-purple-50';
            break;
    }

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
            style={{ fontFamily: 'var(--font-nunito), sans-serif', ...props.style }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

            {/* KUNCI PERBAIKAN: Hapus tag <span> pembungkus agar Flexbox bekerja sempurna */}
            {children}

            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
}