import { COLLECTIONS } from "../constants/collections";
import { Notification } from "../modules/notifications.model";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocumentsByField,
  updateDocument
} from "../utils/firestore.service";
import { AuthorizationError } from "./authorization.service";

export const createNotification=async(
    notification:Notification
)=>{
    await createDocument(
        COLLECTIONS.NOTIFICATIONS,
        notification.id,
        notification
    )
    return notification;
}
export const getNotificationByUserId=async(
    userId:string
)=>{
    return await getDocumentsByField(
        COLLECTIONS.NOTIFICATIONS,
        "userId",
        userId
    )
}
export const getNotificationById=async(
    id:string
)=>{
    return await getDocumentById<Notification>(
        COLLECTIONS.NOTIFICATIONS,
        id
    )
}
export const deleteNotification=async(
    id:string, uid:string
)=>{
    const notification = await getNotificationById(id);
    if (!notification) throw new AuthorizationError("Notification not found", 404);
    if (notification.userId !== uid) throw new AuthorizationError("You can only delete your own notifications");
    await deleteDocument(
        COLLECTIONS.NOTIFICATIONS,
        id
    )
}
export const deleteAllNotificationByUserId=async(
    userId:string
)=>{
    const notifications= await getDocumentsByField(
        COLLECTIONS.NOTIFICATIONS,
        "userId",
        userId
    );
    for (const notification of notifications){
        await deleteDocument(
            COLLECTIONS.NOTIFICATIONS,
            notification.id
        )
    }
}
export const markIsReadNotification=async(
    id:string,
    userId:string
)=>{
    const notification = await getNotificationById(id);

    if(!notification){
        throw new Error("This notifiication was not found");
    }

    if(notification.userId !==userId){
        throw new AuthorizationError("You cannot access this notification");
    }

    await updateDocument(
        COLLECTIONS.NOTIFICATIONS,
        id,
        {
            isRead:true
        }
    )
}