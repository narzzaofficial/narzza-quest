'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: string;
}

export default function LevelUpModal({ isOpen, onClose, newLevel, newTitle }: LevelUpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center text-center py-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full animate-pulse bg-brand/20 blur-2xl scale-150" />
          <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center shadow-card" style={{ backgroundImage: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)' }}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-brand">LEVEL UP!</h2>

        <p className="text-ink-soft text-lg mb-6 font-medium">
          Kamu mencapai <span className="text-brand font-extrabold">Level {newLevel}</span>
        </p>

        <div className="bg-brand-soft border border-brand/15 rounded-card p-5 w-full mb-8">
          <p className="text-xs text-ink-muted mb-1 uppercase tracking-widest font-bold">Gelar Baru Terbuka</p>
          <p className="text-2xl text-ink font-extrabold">{newTitle}</p>
        </div>

        <Button variant="primary" onClick={onClose} className="w-full">
          Terima Kekuatan
        </Button>
      </div>
    </Modal>
  );
}
