import { Timestamp } from "firebase-admin/firestore";

export interface Community{
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    imageStoragePath?: string;
    createdBy:string;

    createdAt: Timestamp;
    updatedAt:Timestamp;
}