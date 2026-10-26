import { Notification } from "../modules/notifications.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments,
    getDocumentsByField
} from "../utils/firestore.service";

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
    return await getDocumentById(
        COLLECTIONS.NOTIFICATIONS,
        id
    )
}
export const deleteNotification=async(
    id:string
)=>{
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
        throw new Error("You cannot acces this notification");
    }

    await updateDocument(
        COLLECTIONS.NOTIFICATIONS,
        id,
        {
            isRead:true
        }
    )
}