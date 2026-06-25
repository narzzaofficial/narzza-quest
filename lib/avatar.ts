/** Returns a DiceBear fun-emoji avatar URL seeded by the user's name. */
export function dicebearAvatar(name: string, size = 200): string {
    return `https://api.dicebear.com/9.x/fun-emoji/png?seed=${encodeURIComponent(name)}&size=${size}`;
}

/** Uploaded avatar if set, otherwise a DiceBear fallback seeded by display name. */
export function getAvatarUrl(avatar: string | null | undefined, displayName: string, size = 200): string {
    return avatar || dicebearAvatar(displayName, size);
}
