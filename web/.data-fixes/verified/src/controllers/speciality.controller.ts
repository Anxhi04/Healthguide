import { Request, Response } from "express";
import {
    createSpeciality,
    getSpecialityById,
    getAllSpecialities,
    deleteSpeciality,
    updateSpeciality
} from "../services/speciality.service";
import { createSpecialitySchema } from "../validation/speciality.validation";
import { ZodError } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

export const createNewSpeciality= async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData = createSpecialitySchema.parse(req.body);
        const speciality = await createSpeciality({
            ...validatedData,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()  
        });
        return res.status(200).json(speciality);
    }catch(error){
        console.log(error);
        if(error instanceof ZodError){
            return res.status(400).json({
                errors:error.issues,
            })
        }
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const editSpeciality= async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}= req.params;
        await updateSpeciality(id, req.body);
        return res.status(200).json({
            message:"Speciality updated"
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        })   
    }

}
export const removeSpeciality = async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}= req.params;
        await deleteSpeciality(id);
        return res.status(200).json({
            message:"Speciality deleted"
        });
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getSpecialities= async(
    req:Request,
    res:Response
)=>{
    try{
        const specialities = await getAllSpecialities();
        return res.status(200).json(specialities);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}
export const getSpeciality= async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const speciality= await getSpecialityById(id)
        if (!speciality){
            return res.status(404).json({
                message:"No speciality was found"
            })
        }
        return res.status(200).json(speciality);
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        });   
    }
}