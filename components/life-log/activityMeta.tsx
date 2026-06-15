import React from 'react';
import { Briefcase, BookOpen, Heart, Users, User, Moon, Car } from 'lucide-react';
import {
    FaFaceTired, FaFaceFrown, FaFaceSmile, FaFaceGrin, FaFaceGrinStars,
    FaDumbbell, FaBookOpen, FaHeart, FaPersonRunning, FaPills,
    FaUtensils, FaDroplet, FaPenNib, FaBullseye, FaLaptopCode, FaMusic, FaLeaf,
} from 'react-icons/fa6';
import type { ActivityCategory } from '@/types';

// Activity category metadata (used in LogForm, CurrentActivityCard, TimelineEntry)
export const CATEGORIES: {
    value: ActivityCategory;
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}[] = [
    { value: 'work',     label: 'Kerja',      icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { value: 'learning', label: 'Belajar',    icon: <BookOpen  className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'health',   label: 'Kesehatan',  icon: <Heart     className="w-4 h-4" />, color: 'text-rose-600',   bg: 'bg-rose-50'   },
    { value: 'social',   label: 'Sosial',     icon: <Users     className="w-4 h-4" />, color: 'text-amber-600',  bg: 'bg-amber-50'  },
    { value: 'personal', label: 'Personal',   icon: <User      className="w-4 h-4" />, color: 'text-teal-600',   bg: 'bg-teal-50'   },
    { value: 'rest',     label: 'Istirahat',  icon: <Moon      className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { value: 'commute',  label: 'Perjalanan', icon: <Car       className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' },
];

export function catMeta(cat: ActivityCategory) {
    return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];
}

// Mood icons — fa6 filled faces, indexed 0–4 (mood value 1–5)
export const MOOD_ICONS: React.ElementType[] = [
    FaFaceTired,     // 1 — terrible
    FaFaceFrown,     // 2 — bad
    FaFaceSmile,     // 3 — okay
    FaFaceGrin,      // 4 — good
    FaFaceGrinStars, // 5 — amazing
];
export const MOOD_COLORS: string[] = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
];

// Habit icons — stored by key string in Firestore
export const HABIT_ICON_MAP: Record<string, React.ElementType> = {
    Dumbbell: FaDumbbell,
    BookOpen: FaBookOpen,
    Heart:    FaHeart,
    Running:  FaPersonRunning,
    Pill:     FaPills,
    Food:     FaUtensils,
    Water:    FaDroplet,
    Writing:  FaPenNib,
    Target:   FaBullseye,
    Laptop:   FaLaptopCode,
    Music:    FaMusic,
    Leaf:     FaLeaf,
};
export const HABIT_ICON_COLORS: Record<string, string> = {
    Dumbbell: '#a855f7',
    BookOpen: '#3b82f6',
    Heart:    '#ef4444',
    Running:  '#22c55e',
    Pill:     '#14b8a6',
    Food:     '#f97316',
    Water:    '#38bdf8',
    Writing:  '#6366f1',
    Target:   '#ef4444',
    Laptop:   '#64748b',
    Music:    '#ec4899',
    Leaf:     '#16a34a',
};
export const HABIT_ICON_NAMES = Object.keys(HABIT_ICON_MAP);
