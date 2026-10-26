import { Timestamp } from "firebase-admin/firestore";

import { PostType, DisplayMode } from "../enums/enums";
import { ReviewStatus } from "../enums/enums";

export interface Post{
    id:string;
    userId:string;
    communityId?:string | null;//postimi mund te jet brenda nje grupi ose invidual i nje personi
    displayMode:DisplayMode;
    type:PostType;
    imageUrls?:string[];
    isAnonymous:boolean;
    status:ReviewStatus;
    content:string;
    title:string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}