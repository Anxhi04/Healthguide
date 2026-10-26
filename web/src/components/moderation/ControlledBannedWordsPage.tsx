import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { BannedWordService, type ActiveBannedWord } from "@/services/bannedWordService";
import BannedWordsList from "./BannedWordsList";
import BannedWordSelect from "./BannedWordSelect";

const message = (error: unknown) => axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
  ? error.response.data.message : "Could not update moderation words. Please try again.";

export default function ControlledBannedWordsPage() {
  const [words, setWords] = useState<ActiveBannedWord[]>([]);
  const [allowed, setAllowed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState("");
  const [removing, setRemoving] = useState<ActiveBannedWord | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([BannedWordService.getAvailableWords(controller.signal), BannedWordService.getActiveWords(controller.signal)])
      .then(([options, active]) => { if (!controller.signal.aborted) { setAllowed(options); setWords(active); setError(null); } })
      .catch(err => { if (!controller.signal.aborted) setError(message(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [version]);

  const options = allowed.filter(word => !words.some(active => active.word.normalize("NFKC").trim().toLowerCase() === word));
  const refresh = () => { setLoading(true); setError(null); setVersion(current => current + 1); };
  const mutate = async (remove?: ActiveBannedWord) => {
    if (lock.current || (!remove && !options.includes(selected))) return;
    lock.current = true; setBusy(true); setMutationError(null); setSuccess(null);
    try {
      if (remove) await BannedWordService.removeWord(remove.id);
      else await BannedWordService.activateWord(selected);
      setAdding(false); setSelected(""); setRemoving(null);
      setSuccess(remove ? "Word removed from the active selection." : "Word added to the active selection.");
      refresh();
    } catch (err) {
      setMutationError(message(err));
      if (axios.isAxiosError(err) && err.response?.status === 409) { setAdding(false); setSelected(""); refresh(); }
    } finally { lock.current = false; setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-50"><div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
    <div className="flex flex-wrap justify-between gap-4"><div className="space-y-2">
      <p className="text-sm text-slate-500">Hospital administration</p>
      <h1 className="text-3xl font-semibold text-slate-900">Banned Words</h1>
      <p className="text-sm text-slate-600">Choose inappropriate terms to flag for review moderation. Negative feedback and low ratings remain valid.</p>
    </div><div className="flex gap-2"><Button variant="outline" disabled={loading || busy} onClick={refresh}>Refresh</Button>
      <Button disabled={loading || busy || error !== null || !options.length} onClick={() => { setSelected(""); setMutationError(null); setAdding(true); }}>Add banned word</Button>
    </div></div>
    {success && <p role="status" className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{success}</p>}
    {mutationError && !adding && <p role="alert" className="text-sm text-red-700">{mutationError}</p>}
    {loading ? <p role="status" className="py-12 text-center text-slate-500">Loading moderation words…</p>
      : error ? <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-white p-6"><p className="text-sm text-red-700">{error}</p><Button onClick={refresh} variant="outline">Retry</Button></div>
      : <BannedWordsList words={words} allowedWords={allowed} disabled={busy} onRemove={word => { setMutationError(null); setRemoving(word); }} />}
    <BannedWordSelect open={adding} options={options} value={selected} busy={busy} error={mutationError}
      onChange={setSelected} onClose={() => { setAdding(false); setSelected(""); setMutationError(null); }} onSubmit={() => void mutate()} />
    <AlertDialog open={removing !== null} onOpenChange={open => { if (!open && !busy) setRemoving(null); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove this active word?</AlertDialogTitle>
        <AlertDialogDescription>This term will no longer flag new reviews in this scope. It remains available in the predefined dictionary.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={() => { if (removing) void mutate(removing); }}>Remove word</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div></div>;
}
