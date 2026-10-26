import { Request, Response } from "express";
import { logFirebaseError } from "../config/firebase";
import { requireManagedHospital } from "../services/authorization.service";
import {
  getAllHospitals,
  getHospitalById
} from "../services/hospital.services";
import { hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";
import { hospitalMutation } from "./hospitalManagement.controller";
import { mutationFailure } from "./mutationResponse";

export const createNewHospital = hospitalMutation("hospital", "create");

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
export const editHospital = hospitalMutation("hospital", "update");

export const removeHospital = hospitalMutation("hospital", "delete");

export const getAllHospital= async(
    req:Request,
    res:Response
)=>{
    try{
        const hospitals = await getAllHospitals();
        return res.status(200).json(hospitals);
    }catch(error){
        logFirebaseError("GET /hospital", error);
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const getMyHospital = async (req: Request, res: Response) => {
  try { return res.json(await requireManagedHospital(req.user.uid)); }
  catch (error) { return mutationFailure(res, error); }
};
