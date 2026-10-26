import { Timestamp } from "firebase-admin/firestore";
import { HospitalStatus, HospitalType } from "../enums/enums";


export interface Hospital{
    id:string;
    adminId:string;
    name:string;
    type:HospitalType;
    city:string;
    address:string;
    phoneNumber:string;
    email:string;
    description?:string;
    photoUrl?:string;
    status:HospitalStatus;

    createdAt:Timestamp;
    updatedAt:Timestamp;
}