import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportStatus } from "@/enums/enums";
import type { AdminReport } from "@/services/reportService";
import { formatDateTime } from "@/lib/date";

export default function ReportCard({ report, children }: { report: AdminReport; children?: ReactNode }) {
  const status = report.status === ReportStatus.REJECTED ? "Dismissed" : report.status === ReportStatus.RESOLVED ? "Resolved" : report.status === ReportStatus.PENDING ? "Pending" : "Status unavailable";
  return <Card data-report-id={report.id} className="border-slate-200 bg-white shadow-sm"><CardContent className="space-y-4 p-5">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold text-slate-900">{report.target?.isReply ? "REPLY" : report.targetType} report</h2>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{status}</span></div>
    <div className="space-y-2 rounded-lg bg-slate-50 p-4">
      {!report.target?.exists && <p className="text-xs text-slate-500">Reported content is no longer available.</p>}
      {report.target?.title && <p className="font-medium text-slate-900">{report.target.title}</p>}
      {report.target?.content && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{report.target.content}</p>}
      {report.target?.rating !== undefined && <p className="text-sm text-slate-600">Rating: {report.target.rating} / 5</p>}
      <p className="text-sm text-slate-600">{report.target?.author?.label || "Unknown user"}</p>
      {report.target?.author?.status && <p className="text-xs text-slate-500">Account: {report.target.author.status}</p>}
    </div>
    <div className="space-y-1"><p className="text-sm font-medium text-slate-800">Reason: {report.reason.replaceAll("_", " ")}</p>
      {report.description && <p className="whitespace-pre-wrap break-words text-sm text-slate-600">{report.description}</p>}
    </div>
    {report.hospital && <p className="text-xs text-slate-500">Hospital: {report.hospital.name}{report.hospital.city ? ` · ${report.hospital.city}` : ""}</p>}
    {report.community && <p className="text-xs text-slate-500">Community: {report.community.name}</p>}
    <p className="text-xs text-slate-500">{formatDateTime(report.createdAt)}</p>
    {report.moderationAction && <p className="text-xs text-slate-500">Action: {report.moderationAction.replaceAll("_", " ")}</p>}
    {children}
  </CardContent></Card>;
}
