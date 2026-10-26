import { Timestamp } from "firebase-admin/firestore";

export interface DoctorAssignments{
    id:string;
    doctorId:string;
    hospitalId:string;
    position?:string;//lidhja shum me shum midis spitaleve dhe doktoreve
    startDate?:Timestamp;
    createdAt:Timestamp;
}