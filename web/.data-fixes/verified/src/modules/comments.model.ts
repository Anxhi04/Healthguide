import { Timestamp } from "firebase-admin/firestore";
import { DisplayMode, ReviewStatus } from "../enums/enums";

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    status:ReviewStatus;
    displayMode: DisplayMode;
    anonymousNumber?: number;
    parentCommentId?: string | null;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
