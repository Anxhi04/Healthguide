import { Timestamp } from "firebase-admin/firestore";
import { MODERATION_WORDS } from "../constants/moderationWords";
import { BannedWordError, createBannedWord } from "../services/bannedWords.services";

// Seed only global, controlled terms. Never run automatically or alter hospital selections.
async function seedBannedWords() {
  for (const word of MODERATION_WORDS) {
    try { await createBannedWord({ id: word, word, createdAt: Timestamp.now() }); }
    catch (error) { if (!(error instanceof BannedWordError && error.statusCode === 409)) throw error; }
  }
}
seedBannedWords().catch(error => { console.error(error); process.exitCode = 1; });
