import { Request, Response } from "express";
import {
    createNotification,
    getNotificationById,
    getNotificationByUserId,
    deleteAllNotificationByUserId,
    deleteNotification,
    markIsReadNotification
}from "../services/notification.service"
import { createNotificationSchema } from "../validation/notification.validation";
import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import crypto from "crypto";

export const addNotification=async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData=createNotificationSchema.parse(req.body);
        const notification=await createNotification({
            ...validatedData,
            id: crypto.randomUUID(),
            userId: req.user.uid,
            isRead:false,
            createdAt: Timestamp.now(),
        });
        return res.status(200).json(notification)
    }catch(error){
        console.log(error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
}

export const getNotification=async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const notification = await getNotificationById(id);
        if(!notification){
            return res.status(404).json({
                message:"This notification was not found"
            })
        }
        return res.status(200).json(notification)

    }catch(error){
        return res.status(500).json({
            message: "Server error"
        });
    }
}

export const getMyNotification=async(
    req:Request,
    res:Response
)=>{
    try{
        const userId=req.user.uid;
        const notifications= await getNotificationByUserId(userId);
        return res.status(200).json(notifications)
    }catch(error){
        return res.status(500).json({
            message:"server error"
        })
    }

}

export const markAsRead=async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const userId=req.user.uid;
        await markIsReadNotification(
            id,
            userId
        );
        return res.status(200).json({
            message:"Notification marked as read"
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const removeNotification=async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        await deleteNotification(id);
        return res.status(200).json({
            message:"Notification deleted"
        });
    }catch(error){
        return res.status(500).json({
            message:error.message || "server error"
        });
    }
}

export const removeAllNotifications=async(
    req:Request,
    res:Response
)=>{
    try{
        const userId=req.user.uid;
        await deleteAllNotificationByUserId(userId);
        return res.status(200).json({
            message:"All notifications got deleted succesfully"
        })
    }catch(error){
        return res.status(400).json({
            message:error.message || "Server error"
        })
    }
}