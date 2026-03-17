'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <div 
            className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center overflow-hidden bg-white"
            style={{
                background: "radial-gradient(circle at center, rgba(243, 232, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)"
            }}
        >
            {/* ── Animated Background Ornaments ── */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
            
            {/* Floating "Mana" Particles */}
            <ManaParticles />

            <div className="flex flex-col items-center relative z-10 scale-110 lg:scale-125">
                {/* Icon Container with multi-layered animations */}
                <div className="relative mb-8">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 bg-purple-400/20 rounded-3xl blur-2xl animate-pulse" />
                    
                    {/* Card Container */}
                    <div className="relative w-24 h-24 bg-white rounded-3xl shadow-[0_20px_50px_rgba(168,85,247,0.15)] flex items-center justify-center border border-purple-100 overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        
                        {/* Compass Icon */}
                        <Compass 
                            className="w-12 h-12 text-purple-600 relative z-10" 
                            style={{ 
                                animation: 'spin 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                                filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.3))'
                            }} 
                        />
                        
                        {/* Sparkle Decoration */}
                        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-purple-300 animate-pulse" />
                    </div>
                </div>
                
                {/* Text Content */}
                <div className="text-center space-y-3 animate-[fadeIn_0.8s_ease-out_forwards]">
                    <h2 
                        className="text-3xl font-bold text-purple-950 tracking-tight" 
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                        Mempersiapkan Peta...
                    </h2>
                    
                    <div className="flex flex-col items-center gap-2">
                        <p 
                            className="text-purple-700/60 font-semibold text-sm tracking-wide uppercase" 
                            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                        >
                            Menyinkronkan data Guild & Misi
                        </p>
                        
                        {/* RPG-style Progress Indicator */}
                        <div className="w-48 h-1.5 bg-purple-100 rounded-full overflow-hidden border border-purple-50">
                            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 w-1/3 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom keyframe for the progress bar if not in globals.css */}
            <style jsx>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); width: 30%; }
                    50% { width: 60%; }
                    100% { transform: translateX(330%); width: 30%; }
                }
            `}</style>
        </div>
    );
}

function ManaParticles() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(6)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-purple-300 rounded-full blur-[2px] animate-[floatUp_4s_linear_infinite]"
                    style={{
                        width: `${Math.random() * 8 + 4}px`,
                        height: `${Math.random() * 8 + 4}px`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`,
                        opacity: Math.random() * 0.5 + 0.2
                    }}
                />
            ))}
        </div>
    );
}