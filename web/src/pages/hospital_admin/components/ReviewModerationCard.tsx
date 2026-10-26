import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisplayMode } from "@/enums/enums";
import type { ModerationReview } from "@/services/reviewService";

function submittedDate(value: ModerationReview["createdAt"]) {
  const seconds = typeof value === "object" ? value._seconds ?? value.seconds : undefined;
  const date = typeof value === "string" ? new Date(value) : new Date((seconds ?? NaN) * 1000);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

export default function ReviewModerationCard({ review, disabled, busy, onApprove, onReject }: {
  review: ModerationReview; disabled: boolean; busy: boolean; onApprove: () => void; onReject: () => void;
}) {
  const author = review.displayMode === DisplayMode.ANONYMOUS ? "Anonymous" : review.author?.firstName || "Reviewer";
  return <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="space-y-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-semibold text-slate-900">{review.targetName}</h2>
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Pending moderation</span>
    </div>
    {review.rating !== undefined && <p className="text-sm text-slate-700">Rating: {review.rating} / 5</p>}
    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{review.comment || "No written review."}</p>
    <p className="text-xs text-slate-500">Flagged content requires manual review. Hidden from public view.</p>
    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{author}</span><span>{submittedDate(review.createdAt)}</span></div>
    <div className="flex gap-2 border-t border-slate-100 pt-4">
      <Button disabled={disabled} onClick={onApprove}>{busy ? "Saving…" : "Approve"}</Button>
      <Button variant="outline" disabled={disabled} onClick={onReject}>Reject</Button>
    </div>
  </CardContent></Card>;
}
