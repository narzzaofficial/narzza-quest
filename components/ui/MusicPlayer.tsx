'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, SkipForward, Disc } from 'lucide-react';

const TRACKS = [
    {
        title: "Sa Critakan Pada Bintang",
        url: "https://soundcloud.com/dj-dian-rmx/mashup-sa-ceritakan-pada",
        author: "Narzza Bard",
        type: "soundcloud"
    },
    {
        title: "Ba Ho Thuyet",
        url: "https://soundcloud.com/minzelo1/ba-ho-thuyet-remix-johnnyannie-dj-hot-tik-tok",
        author: "Narzza Bard",
        type: "soundcloud"
    }
];

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const track = TRACKS[currentTrackIndex];

    const togglePlay = () => {
        if (track.type === "audio") {
            if (!audioRef.current) return;
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(err => console.log("Audio play failed:", err));
            }
        } else if (track.type === "soundcloud") {
            const iframe = iframeRef.current;
            if (!iframe) return;
            const widget = (window as any).SC?.Widget(iframe);
            if (widget) {
                widget.isPaused((paused: boolean) => {
                    if (paused) widget.play();
                    else widget.pause();
                });
            }
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    useEffect(() => {
        if (track.type === "audio") {
            if (audioRef.current && isPlaying) {
                audioRef.current.play().catch(err => console.log("Audio play failed on change:", err));
            }
        } else if (track.type === "soundcloud") {
            // untuk SoundCloud, perlu SC.Widget API
            const iframe = iframeRef.current;
            if (!iframe) return;
            const widget = (window as any).SC?.Widget(iframe);
            if (widget && isPlaying) {
                widget.play();
            }
        }
    }, [currentTrackIndex]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Player Widget */}
            <div
                className={`mb-4 bg-white/90 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-2xl p-4 transition-all duration-500 origin-bottom-right ${isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none w-0 h-0 p-0 overflow-hidden'
                    }`}
            >
                <div className="flex items-center gap-4 w-64">
                    {/* Disc Animation */}
                    <div className="relative">
                        <div className={`w-12 h-12 rounded-full border-2 border-purple-100 flex items-center justify-center bg-purple-50 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                            <Disc className="w-6 h-6 text-purple-600" />
                        </div>
                        {isPlaying && (
                            <div className="absolute -top-1 -right-1">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-purple-950 truncate">{track.title}</p>
                        <p className="text-[10px] text-purple-600 font-medium uppercase tracking-widest">{track.author}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                        </button>
                        <button
                            onClick={nextTrack}
                            className="p-1 text-purple-400 hover:text-purple-600 transition-all"
                            title="Lagu Selanjutnya"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* SoundCloud Embed */}
                {track.type === "soundcloud" && (
                    <iframe
                        ref={iframeRef}
                        width="100%"
                        height="120"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${track.url}&color=%23ff5500&auto_play=${isPlaying}&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                        className="mt-2 rounded-md"
                    ></iframe>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border ${isExpanded
                    ? 'bg-purple-600 border-purple-500 text-white rotate-45'
                    : 'bg-white border-purple-100 text-purple-600 hover:scale-110 active:scale-95'
                    }`}
            >
                {isExpanded ? <Volume2 className="w-6 h-6" /> : <Music className="w-6 h-6 animate-bounce" />}
            </button>

            {/* Hidden Audio Element */}
            {track.type === "audio" && (
                <audio
                    ref={audioRef}
                    src={track.url}
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            )}
        </div>
    );
}
