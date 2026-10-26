import { Timestamp } from "firebase-admin/firestore";

export interface BannedWords {
  id: string;
  word: string;
  // Absent for System Admin global rules; hospital selections are always scoped.
  hospitalId?: string;
  createdAt: Timestamp;
}
