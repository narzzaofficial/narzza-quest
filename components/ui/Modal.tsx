'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
        className="absolute inset-0 bg-ink/30 transition-opacity"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-lg rounded-card bg-surface border border-line p-6 md:p-8 shadow-pop">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-line">
          {title && <h3 className="text-2xl font-extrabold text-ink">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full text-ink-muted hover:text-brand hover:bg-brand-soft transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-ink-soft">{children}</div>
      </div>
    </div>
  );
}
