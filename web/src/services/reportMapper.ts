import { ReportStatus } from "@/enums/enums";
import { toDate } from "@/lib/date";
import type { AdminReport } from "./reportService";

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown): string | undefined => typeof value === "string" && value.trim() ? value : undefined;
export function mapAdminReport(value: unknown): AdminReport | null {
  const report = record(value), target = record(report.target), author = record(target.author);
  const id = text(report.id);
  if (!id) return null;
  const status = Object.values(ReportStatus).includes(report.status as ReportStatus) ? report.status as ReportStatus : "UNKNOWN";
  const targetType = text(report.targetType) ?? "UNKNOWN";
  const hospital = record(report.hospital), community = record(report.community);
  return {
    id, targetType, targetId: text(report.targetId) ?? "",
    reason: text(report.reason) ?? "Reason unavailable",
    ...(text(report.description) ? { description: report.description as string } : {}),
    status, createdAt: toDate(report.createdAt)?.toISOString() ?? null,
    ...(text(report.moderationAction) ? { moderationAction: report.moderationAction as string } : {}),
    target: { exists: target.exists === true,
      ...(text(target.title) ? { title: target.title as string } : {}),
      ...(text(target.content) ? { content: target.content as string } : {}),
      ...(typeof target.rating === "number" && Number.isFinite(target.rating) ? { rating: target.rating } : {}),
      ...(target.isReply === true ? { isReply: true } : {}),
      author: { label: text(author.label) ?? "Unknown user",
        ...(text(author.photoUrl) ? { photoUrl: author.photoUrl as string } : {}),
        ...(text(author.role) ? { role: author.role as string } : {}),
        ...(text(author.status) ? { status: author.status as string } : {}),
      },
    },
    ...(text(hospital.name) ? { hospital: { name: hospital.name as string, ...(text(hospital.city) ? { city: hospital.city as string } : {}) } } : {}),
    ...(text(community.name) ? { community: { name: community.name as string } } : {}),
    canRemove: status === ReportStatus.PENDING && target.exists === true && ["POST", "COMMENT", "REVIEW"].includes(targetType) && !!text(report.targetId) && report.canRemove === true,
    canBlock: status === ReportStatus.PENDING && target.exists === true && !!text(report.targetId) && report.canBlock === true,
  };
}
