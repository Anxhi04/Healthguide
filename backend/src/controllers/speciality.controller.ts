import { Request, Response } from "express";
import {
  getAllSpecialities,
  getSpecialityById
} from "../services/speciality.service";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { hospitalMutation } from "./hospitalManagement.controller";

export const createNewSpeciality = hospitalMutation("speciality", "create");

export const editSpeciality = hospitalMutation("speciality", "update");

export const removeSpeciality = hospitalMutation("speciality", "delete");

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
        const id = reviewDocumentIdSchema.parse(req.params.id);
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