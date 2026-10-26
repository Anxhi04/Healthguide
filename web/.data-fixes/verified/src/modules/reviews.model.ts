import { Timestamp } from "firebase-admin/firestore";
import {TargetType, DisplayMode, ReviewStatus } from "../enums/enums";

export interface Review{
    id:string;
    userId:string;
    targetType:TargetType;
    targetId:string;//review per spitalin ose doctor qe do bej nje x user
    rating?:number;
    comment?:string;//mund te bej ose koment ose rating
    displayMode:DisplayMode;
    status:ReviewStatus;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}