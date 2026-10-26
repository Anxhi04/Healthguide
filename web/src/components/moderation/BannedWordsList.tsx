import { Button } from "@/components/ui/button";
import type { ActiveBannedWord } from "@/services/bannedWordService";

export default function BannedWordsList({ words, allowedWords, disabled, onRemove }: {
  words: ActiveBannedWord[]; allowedWords: string[]; disabled: boolean; onRemove: (word: ActiveBannedWord) => void;
}) {
  if (!words.length) return <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">No moderation words are active.</p>;
  return <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
    {words.map(word => <li key={word.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="space-y-1"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{word.word}</span>
        {!allowedWords.includes(word.word.normalize("NFKC").trim().toLowerCase()) && <p className="pt-1 text-xs text-slate-500">Legacy value outside the dictionary; ignored by moderation.</p>}
      </div><Button variant="outline" disabled={disabled} onClick={() => onRemove(word)}>Remove</Button>
    </li>)}
  </ul>;
}
