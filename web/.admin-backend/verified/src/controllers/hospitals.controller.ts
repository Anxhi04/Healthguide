import { Request, Response } from "express";
import {
    createHospital,
    getHospitalById,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    getHospitalByAdminId
} from  "../services/hospital.services";
import { createHospitalSchema } from "../validation/hospital.validation";
import { hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";
import { ZodError  } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";
import { HospitalStatus } from "../enums/enums";

export const createNewHospital= async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData= createHospitalSchema.parse(req.body);
        const hospital = await createHospital({
            ...validatedData,
            id: crypto.randomUUID(),
            adminId: req.user.uid,//duhet t jet id e personit qe po krijon spitalin
            status:HospitalStatus.PENDING,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()  
        });
        return res.status(200).json(hospital);
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

export const getHospital= async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        const hospital= await getHospitalById(id);
        if(!hospital){
            return res.status(404).json({
                message:"Hospital not found"
            });
        }
        return res.status(200).json(hospital)

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        });

    }
}
export const editHospital = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        await updateHospital(id, req.body);
        return res.status(200).json({
            message:"Hospital  updated"
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        })
    }
}
export const removeHospital = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        await deleteHospital(id);
        return res.status(200).json({
            message:"Hospital deleted"
        });
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getAllHospital= async(
    req:Request,
    res:Response
)=>{
    try{
        const hospitals = await getAllHospitals();
        return res.status(200).json(hospitals);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const getMyHospital = async (
  req: Request,
  res: Response
) => {
  try {
    const adminId = req.user.uid;

    const hospital = await getHospitalByAdminId(adminId);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    return res.status(200).json(hospital);

  } catch (error) {

    console.error("Error in getMyHospital:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
