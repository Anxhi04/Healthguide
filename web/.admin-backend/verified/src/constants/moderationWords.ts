// Backend-owned vocabulary. Changes to this dictionary require a code review.
// Negative healthcare experiences and ratings are never moderation terms.
export const MODERATION_WORDS = Object.freeze([
  "fuck", "fucking", "motherfucker", "shit", "bullshit", "asshole",
  "bastard", "bitch", "cunt", "dickhead", "piss off", "kurvë", "qifsha", "karin",
] as const);

export const normalizeModerationWord = (value: string) => value.normalize("NFKC").trim().toLowerCase();
const allowed = new Set<string>(MODERATION_WORDS);
export const isAllowedModerationWord = (value: string) => allowed.has(normalizeModerationWord(value));

export const matchesModerationWord = (text: string, word: string) => {
  const escaped = normalizeModerationWord(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match whole words/expressions, not innocent substrings such as "skillset".
  return new RegExp(`(^|[^\\p{L}\\p{N}\\p{M}_])${escaped}(?=$|[^\\p{L}\\p{N}\\p{M}_])`, "u")
    .test(normalizeModerationWord(text));
};
