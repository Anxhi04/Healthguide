import { Timestamp } from "firebase-admin/firestore";

export interface HospitalService {
    id:string;
    hospitalId:string;
    serviceId:string;

    createdAt:Timestamp;
}