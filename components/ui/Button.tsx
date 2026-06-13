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
    const baseClasses =
        'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border';

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    };

    const variantClasses = {
        primary: 'bg-brand text-white border-transparent shadow-card hover:bg-brand-hover hover:-translate-y-0.5',
        secondary: 'bg-brand-soft text-brand border-transparent hover:brightness-95',
        outline: 'bg-surface text-brand border-line hover:border-brand/40 hover:bg-brand-soft',
        ghost: 'bg-transparent text-ink-soft border-transparent hover:text-brand hover:bg-surface-2',
    }[variant];

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
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
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
}
