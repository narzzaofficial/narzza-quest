/** Returns a DiceBear fun-emoji avatar URL seeded by the user's name. */
export function dicebearAvatar(name: string, size = 200): string {
    return `https://api.dicebear.com/9.x/fun-emoji/png?seed=${encodeURIComponent(name)}&size=${size}`;
}
