import { Request, Response } from "express";
import {
    getServiceById,
    updateService,
    deleteService,
    createService,
    getAllServices
}from "../services/service.services";
import { createServiceSchema } from "../validation/services.validation";
import { ZodError } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

export const createNewService= async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData = createServiceSchema.parse(req.body);
        const service = await createService({
            ...validatedData,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
     });
        return res.status(200).json(service);
    }catch (error){
        console.log(error);
        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues,
            });
        }
        return res.status(500).json({
            message:"Server error"
        });

    }
}

export const getService = async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const service= await getServiceById(id);
        if(!service){
            return res.status(404).json({
                message:"service not found"
            });
        }
        return res.status(200).json(service);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getServices= async(
    req:Request,
    res:Response 
)=>{
    try{
        const services = await getAllServices()
        return res.status(200).json(services)
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });       
    }
}
export const editService= async(
    req:Request,
    res:Response
)=>{
    try{

        const {id}= req.params;
        await updateService(id, req.body);
        return res.status(200).json({
                message:"service updated"
            });
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });      
    }
}
export const removeService = async(
    req:Request,
    res:Response,
)=>{
    try{
        const {id}= req.params;
        await deleteService(id);
        return res.status(200).json({
            message:"Service deleted"
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}