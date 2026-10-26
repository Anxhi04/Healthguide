import { Timestamp } from "firebase-admin/firestore";

export interface HospitalSpeciality{
    id:string;
    hospitalId:string;
    specialityId:string;
    createdAt:Timestamp;
    updatedAt: Timestamp;
}