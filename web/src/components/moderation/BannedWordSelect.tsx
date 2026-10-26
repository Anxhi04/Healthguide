import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BannedWordSelect({ open, options, value, busy, error, onChange, onClose, onSubmit }: {
  open: boolean; options: string[]; value: string; busy: boolean; error: string | null;
  onChange: (value: string) => void; onClose: () => void; onSubmit: () => void;
}) {
  return <Dialog open={open} onOpenChange={next => { if (!next && !busy) onClose(); }}>
    <DialogContent className="border-slate-200 bg-white">
      <DialogHeader><DialogTitle>Add banned word</DialogTitle>
        <DialogDescription>Select an inappropriate term from the backend-controlled dictionary.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2"><label htmlFor="moderation-word" className="text-sm font-medium text-slate-700">Predefined term</label>
        <select id="moderation-word" value={value} disabled={busy || options.length === 0} onChange={event => onChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900">
          <option value="">Choose a term</option>{options.map(word => <option key={word} value={word}>{word}</option>)}
        </select>
        {!options.length && <p className="text-sm text-slate-500">All available terms are already active.</p>}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <DialogFooter><Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
        <Button disabled={busy || !value || !options.includes(value)} onClick={onSubmit}>{busy ? "Adding…" : "Add"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
