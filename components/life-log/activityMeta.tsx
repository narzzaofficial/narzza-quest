import React from 'react';
import {
    Briefcase, BookOpen, Heart, Users, User, Moon, Car,
    Frown, Meh, Smile, Laugh, SmilePlus,
    Dumbbell, Footprints, Pill, Utensils, Droplets, PenLine, Target, Laptop, Music, Leaf,
} from 'lucide-react';
import type { ActivityCategory } from '@/types';

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

// Mood icons — lucide face icons, indexed 0–4 (mood value 1–5)
export const MOOD_ICONS: React.ElementType[] = [
    Frown,     // 1 — terrible
    Meh,       // 2 — bad
    Smile,     // 3 — okay
    Laugh,     // 4 — good
    SmilePlus, // 5 — amazing
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
    Dumbbell: Dumbbell,
    BookOpen: BookOpen,
    Heart:    Heart,
    Running:  Footprints,
    Pill:     Pill,
    Food:     Utensils,
    Water:    Droplets,
    Writing:  PenLine,
    Target:   Target,
    Laptop:   Laptop,
    Music:    Music,
    Leaf:     Leaf,
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
