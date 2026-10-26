import { Request, Response } from "express";
import {
  getDoctorSpecialities,
  getDoctorSpecialityById
} from "../services/doctorSpeciality.services";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { hospitalMutation } from "./hospitalManagement.controller";

export const createNewDoctorSpeciality = hospitalMutation("doctorSpeciality", "create");

export const getDoctorSpeciality = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = reviewDocumentIdSchema.parse(req.params.id);
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
export const editDoctorSpeciality = hospitalMutation("doctorSpeciality", "update");

export const removeDoctorSpeciality = hospitalMutation("doctorSpeciality", "delete");
