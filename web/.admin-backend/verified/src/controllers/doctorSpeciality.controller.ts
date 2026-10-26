import { Request, Response } from "express";
import {
    getDoctorSpecialityById,
    updateDoctorSpeciality,
    deleteDoctorSpeciality,
    createDoctorSpeciality,
    getDoctorSpecialities,
}from "../services/doctorSpeciality.services";
import { createdoctorSpecialitySchema } from "../validation/doctorSpeciality.validation";
import { ZodError } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

export const createNewDoctorSpeciality= async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData = createdoctorSpecialitySchema.parse(req.body);
        const DoctorSpeciality = await createDoctorSpeciality({
            ...validatedData,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
     });
        return res.status(200).json(DoctorSpeciality);
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

export const getDoctorSpeciality = async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const DoctorSpeciality= await getDoctorSpecialityById(id);
        if(!DoctorSpeciality){
            return res.status(404).json({
                message:"service not found"
            });
        }
        return res.status(200).json(DoctorSpeciality);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getAllDoctorSpecialities= async(
    req:Request,
    res:Response 
)=>{
    try{
        const DoctorSpeciality = await getDoctorSpecialities()
        return res.status(200).json(DoctorSpeciality)
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });       
    }
}
export const editDoctorSpeciality= async(
    req:Request,
    res:Response
)=>{
    try{

        const {id}= req.params;
        await updateDoctorSpeciality(id, req.body);
        return res.status(200).json({
                message:"DoctorSpeciality updated"
            });
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });      
    }
}
export const removeDoctorSpeciality = async(
    req:Request,
    res:Response,
)=>{
    try{
        const {id}= req.params;
        await deleteDoctorSpeciality(id);
        return res.status(200).json({
            message:"Service deleted"
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}