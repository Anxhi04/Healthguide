import { Timestamp } from "firebase-admin/firestore";
import {Role, Gender, UserStatus} from "../enums/enums"
import { UserSettings } from "../interfaces/interfaces";

export interface User{
    id:string;
    firstName:string;
    lastname:string;
    displayId:string;
    email:string;
    phoneNumber:string;
    dateOfBirth:Timestamp;
    gender:Gender;
    photoUrl?:string;
    photoStoragePath?:string;
    city:string;
    role:Role;
    status:UserStatus;
    settings:UserSettings;
    createdAt:Timestamp;
    updatedAt:Timestamp;

}
