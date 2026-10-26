import { Timestamp } from "firebase-admin/firestore";

export interface Notification {
    id: string;
    userId: string;//the person who will get the notification
    title: string;
    message: string;
    isRead: boolean;

    createdAt: Timestamp;
}