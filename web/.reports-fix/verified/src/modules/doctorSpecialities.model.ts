import { Timestamp } from "firebase-admin/firestore";

export interface DoctorSpeciality{
    id:string;
    doctorId:string;
    specialityId:string;//lidhja nje dokt mund te kete disa specialitete
    createdAt:Timestamp;
}