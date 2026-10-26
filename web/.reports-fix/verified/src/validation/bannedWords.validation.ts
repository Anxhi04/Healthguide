import { z } from "zod";
import { isAllowedModerationWord, normalizeModerationWord } from "../constants/moderationWords";

export const createBannedWordsSchema = z.object({
  word: z.string().max(100).transform(normalizeModerationWord)
    .refine(isAllowedModerationWord, "Choose a word from the predefined moderation dictionary"),
}).strict();
export const bannedWordIdSchema = z.string().min(1).max(1500).refine(value => !value.includes("/"), "Invalid word ID");
