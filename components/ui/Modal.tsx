'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-purple-950/20 transition-opacity"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white border border-purple-100 p-6 md:p-8 shadow-[0_20px_60px_rgba(168,85,247,0.2)] transition-all scale-100"
        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-purple-50">
          {title && (
            <h3 
              className="text-2xl font-bold text-purple-950"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {title}
            </h3>
          )}
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-purple-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}