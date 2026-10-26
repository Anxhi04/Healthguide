import { Timestamp} from "firebase-admin/firestore";

export interface Service{
    id:string;    
    name:string;
    description?:string;
    createdAt:Timestamp;
    updatedAt:Timestamp;
}