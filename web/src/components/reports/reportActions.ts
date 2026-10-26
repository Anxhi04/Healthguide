import type { ReportAction } from "@/services/reportService";
export const reportActionLabels: Record<ReportAction, string> = {
  DISMISS: "Dismiss report", RESOLVE: "Resolve report", REMOVE_CONTENT: "Remove content",
  BLOCK_ACCOUNT: "Block account", REMOVE_AND_BLOCK: "Remove content + block account",
};
