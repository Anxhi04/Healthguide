import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ReportService, type AdminReport, type ReportAction } from "@/services/reportService";
import ReportCard from "./ReportCard";
import AdminReportActions from "./AdminReportActions";
import { reportActionLabels } from "./reportActions";

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    return error.response ? `Reports request failed (HTTP ${error.response.status}). Please try again.` : "Could not connect to the reports API. Please try again.";
  }
  return error instanceof Error ? error.message : "Could not process reports. Please try again.";
};
export default function ReportsView({ hospital }: { hospital: boolean }) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [decision, setDecision] = useState<{ report: AdminReport; action: ReportAction } | null>(null);
  const lock = useRef(false);
  const [search] = useSearchParams();
  const targetFilter = search.get("target");
  useEffect(() => {
    const controller = new AbortController();
    ReportService.getReports(controller.signal, hospital).then(data => {
      if (!controller.signal.aborted) { setReports(data); setError(null); }
    }).catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [hospital, version]);
  const refresh = () => { setLoading(true); setError(null); setVersion(current => current + 1); };
  const act = async () => {
    if (!decision || lock.current) return;
    lock.current = true; setBusy(true); setMutationError(null); setSuccess(null);
    try {
      await ReportService.actOnReport(decision.report.id, decision.action, hospital);
      setSuccess(`${reportActionLabels[decision.action]} completed.`); setDecision(null); refresh();
    } catch (err) {
      setMutationError(errorMessage(err)); setDecision(null);
      if (axios.isAxiosError(err) && err.response?.status === 409) refresh();
    } finally { lock.current = false; setBusy(false); }
  };
  const visible = reports.filter(report => !targetFilter || report.targetType === targetFilter);
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><div className="space-y-2">
      <p className="text-sm text-slate-500">{hospital ? "Hospital administration" : "System administration"}</p>
      <h1 className="text-3xl font-semibold text-slate-900">{targetFilter === "REVIEW" ? "Review reports" : "Reports"}</h1>
      <p className="text-sm text-slate-600">{hospital ? "Resolve or dismiss review reports related to your hospital. Negative criticism and low ratings are allowed. Pending review moderation is separate." : "Inspect global user and community reports unrelated to hospitals or doctors."}</p>
    </div><Button variant="outline" disabled={loading || busy} onClick={refresh}>Refresh</Button></div>
    {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}
    {mutationError && <p role="alert" className="text-sm text-red-700">{mutationError}</p>}
    {loading ? <p role="status" className="py-12 text-center text-slate-500">Loading reports…</p>
      : error ? <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-white p-6"><p className="text-sm text-red-700">{error}</p><Button variant="outline" onClick={refresh}>Retry</Button></div>
      : !visible.length ? <p className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-600">No reports found.</p>
      : <div className="grid gap-4 md:grid-cols-2">{visible.map(report => <ReportCard key={report.id} report={report}>
        {<AdminReportActions report={report} disabled={busy} onAction={action => { setMutationError(null); setDecision({ report, action }); }} />}
      </ReportCard>)}</div>}
  </div>
    <AlertDialog open={decision !== null} onOpenChange={open => { if (!open && !busy) setDecision(null); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{decision ? reportActionLabels[decision.action] : "Moderate report"}?</AlertDialogTitle>
        <AlertDialogDescription>{decision?.action === "REMOVE_CONTENT" || decision?.action === "REMOVE_AND_BLOCK"
          ? "The reported content will be removed using the existing deletion policy. Surviving comment replies are retained. " : ""}
          {decision?.action === "BLOCK_ACCOUNT" || decision?.action === "REMOVE_AND_BLOCK" ? "The reported account will be blocked from changing HealthGuide data. Its Firebase account and history are retained. " : ""}
          {decision?.action === "DISMISS" ? "This report will be dismissed without enforcement." : "This report will be marked resolved."}
        </AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={event => { event.preventDefault(); void act(); }}>{busy ? "Saving…" : "Confirm"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </main>;
}
