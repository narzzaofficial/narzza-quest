// Identity of the virtual AI Game Master. The AI never logs in — this is the
// persona used to author/review quests on the player's behalf (solo mode).

export const AI_GM_ID = 'ai-gm';

export const AI_GM = {
    id: AI_GM_ID,
    name: 'AI Game Master',
    title: 'Personal AI Game Master',
    tagline: 'Nyusun & nge-review misimu otomatis',
    avatar: 'https://ui-avatars.com/api/?name=AI&background=4f7cff&color=ffffff&bold=true&size=200',
} as const;

/** True if a quest was authored by the AI Game Master. */
export function isAIQuest(createdBy: string | undefined): boolean {
    return createdBy === AI_GM_ID;
}
