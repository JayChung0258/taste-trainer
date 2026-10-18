// Progress lives only in this browser (MVP: no accounts, no backend).
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const KEY = 'dtt:progress:v1';

export type Progress = Record<string, { pick: string; at: number }>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function savePick(questionId: string, pick: string | null): void {
  try {
    const progress = loadProgress();
    if (pick === null) delete progress[questionId];
    else progress[questionId] = { pick, at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Progress is a convenience; the page works without it.
  }
}
