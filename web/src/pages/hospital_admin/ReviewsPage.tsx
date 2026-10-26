import {
AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ReviewStatus } from "@/enums/enums";
import { ReviewService,type ModerationReview } from "@/services/reviewService";
import axios from "axios";
import { useCallback,useEffect,useRef,useState } from "react";
import ReviewModerationCard from "./components/ReviewModerationCard";

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
    ? error.response.data.message : "Could not process reviews. Please try again.";
}

export default function ReviewsPage({ doctor = false }: { doctor?: boolean }) {
  const [reviews, setReviews] = useState<ModerationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<ModerationReview | null>(null);
  const mutationLock = useRef(false);
  const request = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const data = await (doctor ? ReviewService.getDoctorModerationQueue(controller.signal) : ReviewService.getHospitalModerationQueue(controller.signal));
      if (!controller.signal.aborted) { setReviews(data); setError(null); }
    } catch (err) {
      if (!controller.signal.aborted) setError(errorMessage(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [doctor]);
  useEffect(() => {
    // State updates in load follow the API response; this effect starts the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => request.current?.abort();
  }, [load]);
  const refresh = () => { setLoading(true); setError(null); return load(); };

  const moderate = async (review: ModerationReview, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setSaving(review.id);
    setMutationError(null);
    setSuccess(null);
    try {
      await (doctor ? ReviewService.moderateDoctorReview(review.id, status) : ReviewService.moderateHospitalReview(review.id, status));
      setReviews(current => current.filter(item => item.id !== review.id));
      setSuccess(status === ReviewStatus.APPROVED ? "Review approved and publicly visible." : "Review rejected and remains hidden.");
      await refresh();
    } catch (err) {
      setMutationError(errorMessage(err));
      if (axios.isAxiosError(err) && err.response?.status === 409) await refresh();
    } finally { mutationLock.current = false; setSaving(null); }
  };

  return <div className="min-h-screen bg-slate-50"><div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="space-y-2">
      <p className="text-sm font-medium text-slate-500">{doctor ? "System administration" : "Hospital administration"}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Review Moderation</h1>
      <p className="text-sm text-slate-600">{doctor ? "Review flagged doctor feedback before it becomes public." : "Review flagged hospital feedback before it becomes public."}</p>
    </div><Button variant="outline" disabled={loading || saving !== null} onClick={() => void refresh()}>Refresh</Button></div>
    {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</p>}
    {mutationError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{mutationError}</p>}
    {loading ? <p role="status" className="py-12 text-center text-slate-500">Loading reviews…</p>
      : error ? <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-white p-6"><p className="text-sm text-red-700">{error}</p><Button variant="outline" onClick={() => void refresh()}>Retry</Button></div>
      : reviews.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">No reviews are waiting for moderation.</p>
      : <div className="grid gap-4 md:grid-cols-2">{reviews.map(review => <ReviewModerationCard key={review.id} review={review} disabled={saving !== null}
        busy={saving === review.id} onApprove={() => void moderate(review, ReviewStatus.APPROVED)} onReject={() => { setMutationError(null); setRejecting(review); }} />)}</div>}
  </div>
  <AlertDialog open={rejecting !== null} onOpenChange={open => { if (!open) setRejecting(null); }}><AlertDialogContent>
    <AlertDialogHeader><AlertDialogTitle>Reject this review?</AlertDialogTitle><AlertDialogDescription>The review will remain hidden from public view and leave the moderation queue.</AlertDialogDescription></AlertDialogHeader>
    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={saving !== null} onClick={() => { if (rejecting) void moderate(rejecting, ReviewStatus.REJECTED); }}>Reject review</AlertDialogAction></AlertDialogFooter>
  </AlertDialogContent></AlertDialog></div>;
}
