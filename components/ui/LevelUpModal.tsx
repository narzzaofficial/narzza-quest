'use client';

import React from 'react';
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
        
        {/* Animasi Glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full animate-pulse bg-pink-200 blur-2xl scale-150" />
          <div className="text-7xl relative z-10 drop-shadow-lg">🌟</div>
        </div>

        <h2 
          className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          LEVEL UP!
        </h2>
        
        <p className="text-slate-500 text-lg mb-6 font-medium">
          You have reached <span className="text-purple-600 font-extrabold">Level {newLevel}</span>
        </p>
        
        {/* New Title Box */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 w-full mb-8">
          <p className="text-xs text-purple-400 mb-1 uppercase tracking-widest font-bold">New Title Unlocked</p>
          <p className="text-2xl text-purple-900 font-bold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            {newTitle}
          </p>
        </div>

        <Button variant="primary" onClick={onClose} className="w-full">
          Accept Power
        </Button>
      </div>
    </Modal>
  );
}