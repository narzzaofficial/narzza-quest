export const getFirestoreDocUrl = (questId: string, updateMaskFields: string[]) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID belum di-set.');

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/quests/${encodeURIComponent(questId)}`;
    const params = new URLSearchParams();
    updateMaskFields.forEach((field) => params.append('updateMask.fieldPaths', field));
    return `${baseUrl}?${params.toString()}`;
};

export const patchQuestWithUserToken = async ({
    idToken,
    questId,
    fields,
    updateMaskFields,
}: {
    idToken: string;
    questId: string;
    fields: Record<string, unknown>;
    updateMaskFields: string[];
}) => {
    const url = getFirestoreDocUrl(questId, updateMaskFields);

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
    });

    return response;
};
