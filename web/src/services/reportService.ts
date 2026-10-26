import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";
import { ReportStatus } from "@/enums/enums";
import { mapAdminReport } from "./reportMapper";

export interface AdminReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus | "UNKNOWN";
  createdAt: string | null;
  moderationAction?: string;
  target: { exists: boolean; title?: string; content?: string; rating?: number; isReply?: boolean;
    author: { label: string; photoUrl?: string; role?: string; status?: string } };
  hospital?: { name: string; city?: string };
  community?: { name: string };
  canRemove: boolean;
  canBlock: boolean;
}
export type ReportAction = "DISMISS" | "RESOLVE" | "REMOVE_CONTENT" | "BLOCK_ACCOUNT" | "REMOVE_AND_BLOCK";

export const ReportService = {
  async getReports(signal?: AbortSignal, hospital = false): Promise<AdminReport[]> {
    const response = await api.get(hospital ? endpoints.REPORTS.HOSPITAL : endpoints.REPORTS.GET_ALL, { signal });
    if (!Array.isArray(response.data)) throw new Error("The reports API returned an invalid response.");
    return response.data.map(mapAdminReport).filter((report): report is AdminReport => report !== null);
  },
  async actOnReport(id: string, action: ReportAction, hospital = false): Promise<void> {
    await api.patch(hospital ? `/report/hospital/${encodeURIComponent(id)}/moderation` : endpoints.REPORTS.MODERATE(id), { action });
  },
};
