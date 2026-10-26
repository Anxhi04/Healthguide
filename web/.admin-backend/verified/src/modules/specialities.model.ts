import { Timestamp } from "firebase-admin/firestore";

export interface Speciality{
    id:string;
    name:string;
    description?:string;
    createdAt:Timestamp;
    updatedAt:Timestamp;
} 