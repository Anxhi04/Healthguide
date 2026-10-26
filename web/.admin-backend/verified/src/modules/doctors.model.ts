import { Timestamp } from "firebase-admin/firestore";


export interface Doctor{
    id:string;
    name:string;
    lastName:string;
    phoneNumber?:string;
    photoUrl?:string;
    biography?:string;
    experienceYears?: number;
    licenseNumber?:string;

    createdAt: Timestamp;
    updatedAt: Timestamp;

}