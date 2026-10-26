import { Timestamp } from "firebase-admin/firestore";

export interface CommunityMembers{
    id:string;
    userId:string;
    communityId:string;
    // role:Role;
    joinedAt:Timestamp;
}