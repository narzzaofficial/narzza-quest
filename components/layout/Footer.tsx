'use client';

import React from 'react';
import { Heart, Sparkles, Coffee, ExternalLink, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-12 px-6 mt-auto border-t border-line">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
                {/* Divider */}
                <div className="flex items-center gap-4 w-full max-w-lg mb-8 opacity-50">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-line-strong" />
                    <Sparkles className="w-5 h-5 text-brand" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-line-strong" />
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm font-black text-ink uppercase tracking-[0.2em] flex items-center gap-2">
                        Build with
                        <Heart className="w-4 h-4 text-danger fill-current" />
                        by
                        <a
                            href="https://narzza.studio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-hover transition-colors flex items-center gap-1.5 font-black"
                        >
                            Narzza <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">© {currentYear} Narzza Quest</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-line-strong" />
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand" /> Local Pride HQ
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-line-strong" />
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5">
                            Stay Focused <Coffee className="w-4 h-4 text-xp" />
                        </p>
                    </div>

                    <p className="text-xs italic text-ink-muted mt-4 font-semibold max-w-xs leading-relaxed">
                        &ldquo;Your progress is the only trophy that matters.&rdquo;
                    </p>
                </div>
            </div>
        </footer>
    );
}
