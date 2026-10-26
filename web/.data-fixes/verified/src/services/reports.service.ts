import { Report } from "../modules/reports.model";
import { COLLECTIONS } from "../constants/collections";
import {
    getDocumentsByField,
    getDocumentById,
    deleteDocument,
    getAllDocuments
} from "../utils/firestore.service";
import crypto from "crypto";
import { db } from "../config/firebase";
import { createReportSchema, type CreateReportInput } from "../validation/reports.validation";
import { ReportStatus, ReportTargetType, ReviewStatus, Role, TargetType, UserStatus, DisplayMode } from "../enums/enums";
import { AccountRestrictionError, assertAccountCanMutate } from "./accountStatus.service";
import { Timestamp, DocumentData } from "firebase-admin/firestore";
import { getUserById } from "./user.services";
import { getHospitalByAdminId } from "./hospital.services";
import { prepareContentRemoval } from "./contentRemoval.service";
import { reportActionSchema, ReportAction } from "../validation/reports.validation";

export class ReportError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code?: string) { super(message); }
}
const targetCollections = {
  [ReportTargetType.POST]: COLLECTIONS.POSTS,
  [ReportTargetType.COMMENT]: COLLECTIONS.COMMENTS,
  [ReportTargetType.REVIEW]: COLLECTIONS.REVIEWS,
  [ReportTargetType.USER]: COLLECTIONS.USERS,
};
export const createReport = async (uid: string, input: CreateReportInput) => {
  if (!uid) throw new ReportError("Authentication required", 401);
  const data = createReportSchema.parse(input);
  const id = crypto.randomUUID();
  const reports = db.collection(COLLECTIONS.REPORTS);
  const target = db.collection(targetCollections[data.targetType]).doc(data.targetId);
  const key = crypto.createHash("sha256").update(JSON.stringify([uid, data.targetType, data.targetId])).digest("hex");
  // A guard in a subcollection never appears in the Admin report list. All report
  // history stays in the existing reports collection with its original IDs.
  const guard = reports.doc("_active").collection("targets").doc(key);
  await db.runTransaction(async transaction => {
    const reporter = await transaction.get(db.collection(COLLECTIONS.USERS).doc(uid));
    if (!reporter.exists) throw new ReportError("Complete your profile before reporting.", 404);
    // Transactional recheck prevents an account block racing report creation.
    try { assertAccountCanMutate(reporter.data() as import("../modules/users.model").User); }
    catch (error) { if (error instanceof AccountRestrictionError) throw new ReportError(error.message, error.statusCode, error.code); throw error; }
    const snapshot = await transaction.get(target);
    if (!snapshot.exists) throw new ReportError("Report target not found", 404);
    const entity = snapshot.data()!;
    const owner = data.targetType === ReportTargetType.USER ? snapshot.id : entity.userId;
    if (owner === uid) throw new ReportError("You cannot report yourself or your own content.", 403);
    if (typeof owner !== "string" || !owner) throw new ReportError("Report target not found", 404);
    if (data.targetType === ReportTargetType.USER) {
      if (entity.settings?.privacy?.publicProfile === false) throw new ReportError("Report target not found", 404);
    } else if (entity.status !== ReviewStatus.APPROVED) {
      throw new ReportError("Report target not found", 404);
    }
    const active = await transaction.get(guard);
    if (active.exists) {
      const previous = await transaction.get(reports.doc(active.data()!.reportId));
      if (previous.exists && previous.data()!.status === ReportStatus.PENDING)
        throw new ReportError("You already have a report awaiting review for this content.", 409);
    } else {
      // Include reports created before guards existed, without scanning all reports.
      const previous = await transaction.get(reports.where("userId", "==", uid));
      if (previous.docs.some(row => {
        const report = row.data() as Report;
        return report.targetType === data.targetType && report.targetId === data.targetId && report.status === ReportStatus.PENDING;
      })) throw new ReportError("You already have a report awaiting review for this content.", 409);
    }
    const now = Timestamp.now();
    const report: Report = { id, userId: uid, targetType: data.targetType, targetId: data.targetId,
      reason: data.reason, ...(data.description ? { description: data.description } : {}),
      status: ReportStatus.PENDING, createdAt: now, updatedAt: now };
    if (data.targetType === ReportTargetType.REVIEW) {
      if (entity.targetType === TargetType.HOSPITAL) report.hospitalIds = [entity.targetId];
      else if (entity.targetType === TargetType.DOCTOR) {
        const assignments = await transaction.get(db.collection(COLLECTIONS.DOCTOR_ASSIGNMENTS).where("doctorId", "==", entity.targetId));
        report.hospitalIds = [...new Set(assignments.docs.map(row => row.data().hospitalId).filter((id): id is string => typeof id === "string" && !!id))];
      }
    }
    transaction.set(reports.doc(id), report);
    transaction.set(guard, { reportId: id });
  });
  // Never return a target document, owner UID, reporter UID or private profile data.
  return { id, targetType: data.targetType, targetId: data.targetId, status: ReportStatus.PENDING };
};
export const getReportById=async(
    reportId:string
)=>{
    return await getDocumentById<Report>(
        COLLECTIONS.REPORTS,
        reportId
    )
}

export const getAllReports=async()=>{
    return await getAllDocuments<Report>(
        COLLECTIONS.REPORTS
    )
}
//reports  qe ka bere nje user i caktuar
export const getReportsByUserId=async(
    userId:string
)=>{
    return await getDocumentsByField<Report>(
        COLLECTIONS.REPORTS,
        "userId",
        userId
    )
}
//reports qe ka nje postim
export const getReportsByPostId=async(postId:string)=>{
    const reports = await getDocumentsByField<Report>(COLLECTIONS.REPORTS, "targetId", postId);
    return reports.filter(report => report.targetType === ReportTargetType.POST);
}
export const deleteReport=async(
    reportId:string
)=>{
    await deleteDocument(
        COLLECTIONS.REPORTS,
        reportId
    )
}
const moderationScope = async (uid: string) => {
  const user = await getUserById(uid);
  if (user?.role === Role.ADMIN) return { admin: true, hospitalId: undefined as string | undefined };
  if (user?.role !== Role.HOSPITAL_ADMIN) throw new ReportError("Report access denied", 403);
  const hospital = await getHospitalByAdminId(uid);
  if (!hospital) throw new ReportError("No managed hospital found", 403);
  return { admin: false, hospitalId: hospital.id };
};
const validReferenceId = (id: unknown): id is string => typeof id === "string" && !!id.trim() && !id.includes("/") && Buffer.byteLength(id, "utf8") <= 1500 && id !== "." && id !== "..";
const optionalDocument = async (collection: string, id: unknown): Promise<DocumentData | null> =>
  validReferenceId(id) ? getDocumentById<DocumentData>(collection, id) : null;
const targetDocument = async (report: Report): Promise<DocumentData | null> => {
  const collection = targetCollections[report.targetType];
  return collection ? optionalDocument(collection, report.targetId) : null;
};
const hospitalsForReport = async (report: Report, target: DocumentData | null): Promise<string[]> => {
  // Only reviews have hospital/doctor ownership in the actual model.
  if (report.targetType !== ReportTargetType.REVIEW) return [];
  if (!target) return Array.isArray(report.hospitalIds) ? report.hospitalIds.filter(validReferenceId) : (validReferenceId(report.hospitalId) ? [report.hospitalId] : []);
  if (target.targetType === TargetType.HOSPITAL) return validReferenceId(target.targetId) ? [target.targetId] : [];
  if (target.targetType !== TargetType.DOCTOR || !validReferenceId(target.targetId)) return [];
  const assignments = await getDocumentsByField<DocumentData>(COLLECTIONS.DOCTOR_ASSIGNMENTS, "doctorId", target.targetId);
  return [...new Set(assignments.map(row => row.hospitalId).filter((id): id is string => typeof id === "string" && !!id))];
};
const reportInScope = async (report: Report, target: DocumentData | null, scope: {admin: boolean; hospitalId?: string}) =>
  scope.admin ? report.targetType !== ReportTargetType.REVIEW : (await hospitalsForReport(report, target)).includes(scope.hospitalId!);
const contentPreview = (target: DocumentData) => ({
  ...(typeof target.title === "string" ? { title: target.title } : {}),
  ...(typeof target.content === "string" ? { content: target.content } : {}),
  ...(typeof target.comment === "string" ? { content: target.comment } : {}),
  ...(typeof target.rating === "number" ? { rating: target.rating } : {}),
});
const presentModerationReport = async (report: Report, target: DocumentData | null, uid: string, admin: boolean, managedHospitalId?: string) => {
  const ownerId = target ? (report.targetType === ReportTargetType.USER ? report.targetId : target.userId) : undefined;
  const anonymous = target?.displayMode === DisplayMode.ANONYMOUS || target?.isAnonymous === true;
  const owner = validReferenceId(ownerId) ? await getUserById(ownerId) : null;
  const hospitalId = managedHospitalId ?? (await hospitalsForReport(report, target))[0];
  const hospital = await optionalDocument(COLLECTIONS.HOSPITALS, hospitalId);
  const community = await optionalDocument(COLLECTIONS.COMMUNITIES, target?.communityId);
  return {
    id: report.id, targetType: report.targetType, targetId: report.targetId,
    reason: typeof report.reason === "string" ? report.reason : "Reason unavailable", ...(typeof report.description === "string" ? { description: report.description } : {}),
    status: Object.values(ReportStatus).includes(report.status) ? report.status : "UNKNOWN", createdAt: report.createdAt ?? null,
    ...(typeof report.moderationAction === "string" ? { moderationAction: report.moderationAction } : {}),
    target: { exists: !!target, ...contentPreview(target ?? report.removedPreview ?? {}),
      ...(target?.parentCommentId ? { isReply: true } : {}),
      author: anonymous ? { label: "Anonymous" } : owner ? {
        label: `${owner.firstName ?? ""} ${owner.lastname ?? ""}`.trim() || "User",
        ...(typeof owner.photoUrl === "string" ? { photoUrl: owner.photoUrl } : {}),
        ...(report.targetType === ReportTargetType.USER ? { ...(typeof owner.role === "string" ? { role: owner.role } : {}), ...(typeof owner.status === "string" ? { status: owner.status } : {}) } : {}),
      } : { label: "Unknown user" },
    },
    ...(hospital ? { hospital: { name: typeof hospital.name === "string" ? hospital.name : "Hospital", ...(typeof hospital.city === "string" ? { city: hospital.city } : {}) } } : {}),
    ...(community ? { community: { name: typeof community.name === "string" ? community.name : "Community" } } : {}),
    canRemove: admin && report.status === ReportStatus.PENDING && !!target && report.targetType !== ReportTargetType.USER,
    canBlock: admin && report.status === ReportStatus.PENDING && !!owner && owner.id !== uid && owner.role !== Role.ADMIN && owner.status !== UserStatus.BLOCKED,
  };
};
export const getModerationReports = async (uid: string, postId?: string) => {
  const scope = await moderationScope(uid);
  const types = scope.admin ? [ReportTargetType.POST, ReportTargetType.COMMENT, ReportTargetType.USER] : [ReportTargetType.REVIEW];
  const reports = postId ? await getReportsByPostId(postId) : (await Promise.all(types.map(type => getDocumentsByField<Report>(COLLECTIONS.REPORTS, "targetType", type)))).flat();
  const presented = await Promise.all(reports.filter(report => !!targetCollections[report.targetType]).map(async report => {
    const target = await targetDocument(report);
    if (!await reportInScope(report, target, scope)) return null;
    return presentModerationReport(report, target, uid, scope.admin, scope.hospitalId);
  }));
  return presented.filter(report => report !== null);
};
export const getModerationReport = async (uid: string, id: string) => {
  const scope = await moderationScope(uid);
  const report = await getReportById(id);
  if (!report) throw new ReportError("Report not found", 404);
  const target = await targetDocument(report);
  if (!await reportInScope(report, target, scope)) throw new ReportError("Report not found", 404);
  return presentModerationReport(report, target, uid, scope.admin, scope.hospitalId);
};
export const moderateReport = async (uid: string, id: string, actionInput: ReportAction) => {
  const { action } = reportActionSchema.parse({ action: actionInput });
  return db.runTransaction(async transaction => {
    const actor = await transaction.get(db.collection(COLLECTIONS.USERS).doc(uid));
    if (actor.data()?.role !== Role.ADMIN || actor.data()?.status === UserStatus.BLOCKED)
      throw new ReportError("Administrator permission required", 403);
    const ref = db.collection(COLLECTIONS.REPORTS).doc(id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new ReportError("Report not found", 404);
    const report = snapshot.data() as Report;
    if (report.targetType === ReportTargetType.REVIEW) throw new ReportError("Hospital and doctor reports are outside global moderation scope", 403);
    if (report.status !== ReportStatus.PENDING) throw new ReportError("This report is already handled", 409);
    const removing = action === "REMOVE_CONTENT" || action === "REMOVE_AND_BLOCK";
    const blocking = action === "BLOCK_ACCOUNT" || action === "REMOVE_AND_BLOCK";
    let target: DocumentData | undefined;
    if (removing || blocking) {
      const collection = targetCollections[report.targetType];
      if (!collection) throw new ReportError("Unsupported report target", 400);
      target = (await transaction.get(db.collection(collection).doc(report.targetId))).data();
      if (!target) throw new ReportError("Reported target no longer exists", 409);
    }
    if (removing && report.targetType === ReportTargetType.USER) throw new ReportError("User profiles cannot be removed as content", 400);
    const ownerId = report.targetType === ReportTargetType.USER ? report.targetId : target?.userId;
    let accountRef;
    if (blocking) {
      if (typeof ownerId !== "string" || !ownerId) throw new ReportError("Reported account not found", 404);
      if (ownerId === uid) throw new ReportError("You cannot block yourself", 403);
      accountRef = db.collection(COLLECTIONS.USERS).doc(ownerId);
      const owner = await transaction.get(accountRef);
      if (!owner.exists) throw new ReportError("Reported account not found", 404);
      if (owner.data()?.role === Role.ADMIN) throw new ReportError("Administrator accounts cannot be blocked through reports", 403);
    }
    const remove = removing ? await prepareContentRemoval(transaction, targetCollections[report.targetType], report.targetId, uid) : undefined;
    const now = Timestamp.now();
    if (remove) remove();
    if (accountRef) transaction.update(accountRef, { status: UserStatus.BLOCKED, updatedAt: now });
    const status = action === "DISMISS" ? ReportStatus.REJECTED : ReportStatus.RESOLVED;
    transaction.update(ref, { status, moderationAction: action, moderatedBy: uid, moderatedAt: now, updatedAt: now,
      ...(removing && target ? { removedPreview: contentPreview(target) } : {}),
    });
    return { id, status, action };
  });
};
