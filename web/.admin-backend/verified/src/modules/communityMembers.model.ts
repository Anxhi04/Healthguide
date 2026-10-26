import { Timestamp } from "firebase-admin/firestore";
import { Role } from "../enums/enums";

export interface CommunityMembers{
    id:string;
    userId:string;
    communityId:string;
    // role:Role;
    joinedAt:Timestamp;
}