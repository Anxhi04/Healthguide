import { Request, Response } from "express";
import {
  getDoctorsByHospitalAndSpeciality,
  getHospitalSpecialities,
  getHospitalSpecialityById,
  getSpecialitiesByHospitalId,
  HospitalDirectoryError
} from "../services/hospitalSpeciality.services";
import { hospitalMutation } from "./hospitalManagement.controller";

import { hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";

import { ZodError } from "zod";

export const createNewHospitalSpeciality = hospitalMutation("hospitalSpeciality", "create");

export const getHospitalSpeciality = async (
    req: Request,
    res: Response
) => {

    try {

        const id = hospitalDirectoryIdSchema.parse(req.params.id);

        const hospitalSpeciality =
            await getHospitalSpecialityById(id);

        if (!hospitalSpeciality) {
            return res.status(404).json({
                message: "Hospital speciality not found"
            });
        }

        return res.status(200).json(hospitalSpeciality);

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }

};

export const getAllHospitalSpecialities = async (
    req: Request,
    res: Response
) => {

    try {

        const hospitalSpecialities =
            await getHospitalSpecialities();

        return res.status(200).json(hospitalSpecialities);

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }

};

export const editHospitalSpeciality = hospitalMutation("hospitalSpeciality", "update");

export const removeHospitalSpeciality = hospitalMutation("hospitalSpeciality", "delete");

export const getSpecialitiesOfHospital=async(
    req:Request,
    res:Response
)=>{
    try{
        const hospitalId = hospitalDirectoryIdSchema.parse(req.params.hospitalId);
        const specialities= await getSpecialitiesByHospitalId(hospitalId);
        return res.status(200).json(specialities)
    }catch(error){
        return directoryError(res, error);

    }
}
export const getDoctorsByHospitalAndSpecialityController = async (
    req: Request,
    res: Response
) => {
    try {
        const hospitalId = hospitalDirectoryIdSchema.parse(req.params.hospitalId);
        const specialityId = hospitalDirectoryIdSchema.parse(req.params.specialityId);

        const doctors =
            await getDoctorsByHospitalAndSpeciality(
                hospitalId,
                specialityId
            );

        return res.status(200).json(doctors);

    } catch (error) {
        return directoryError(res, error);
    }
};

const directoryError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) return res.status(400).json({ message: error.issues[0]?.message });
    if (error instanceof HospitalDirectoryError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: "Could not load the hospital directory. Please try again." });
};
