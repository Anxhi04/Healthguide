import { Timestamp } from "firebase-admin/firestore";
import { ReportStatus, ReportTargetType } from "../enums/enums";

export interface Report {
    id: string;
    userId:string;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    description?: string;
    status: ReportStatus;

    createdAt: Timestamp;
    updatedAt?: Timestamp;
    hospitalId?: string;
    hospitalIds?: string[];
    moderationAction?: string;
    moderatedBy?: string;
    moderatedAt?: Timestamp;
    removedPreview?: { title?: string; content?: string; rating?: number };
}
