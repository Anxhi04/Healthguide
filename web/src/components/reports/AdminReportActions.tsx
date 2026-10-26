import { Button } from "@/components/ui/button";
import { ReportStatus } from "@/enums/enums";
import type { AdminReport, ReportAction } from "@/services/reportService";

import { reportActionLabels } from "./reportActions";
export default function AdminReportActions({ report, disabled, onAction }: {
  report: AdminReport; disabled: boolean; onAction: (action: ReportAction) => void;
}) {
  if (report.status !== ReportStatus.PENDING) return null;
  const actions: ReportAction[] = ["DISMISS", "RESOLVE"];
  if (report.canRemove) actions.push("REMOVE_CONTENT");
  if (report.canBlock) actions.push("BLOCK_ACCOUNT");
  if (report.canRemove && report.canBlock) actions.push("REMOVE_AND_BLOCK");
  return <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">{actions.map(action =>
    <Button key={action} variant="outline" disabled={disabled} onClick={() => onAction(action)}
      className={action === "DISMISS" || action === "RESOLVE" ? "" : "border-rose-200 text-rose-800 hover:bg-rose-50"}>{reportActionLabels[action]}</Button>)}</div>;
}
