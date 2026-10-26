import { Request, Response } from "express";
import {
    createHospitalSpeciality,
    getHospitalSpecialityById,
    getHospitalSpecialities,
    updateHospitalSpeciality,
    deleteHospitalSpeciality,
    getSpecialitiesByHospitalId,
    getDoctorsByHospitalAndSpeciality,
    HospitalDirectoryError
} from "../services/hospitalSpeciality.services";

import { createHospitalSpecialitySchema, hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";

import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import crypto from "crypto";

export const createNewHospitalSpeciality = async (
    req: Request,
    res: Response
) => {
    try {

        const validatedData =
            createHospitalSpecialitySchema.parse(req.body);

        const hospitalSpeciality =
            await createHospitalSpeciality({

                ...validatedData,

                id: crypto.randomUUID(),

                createdAt: Timestamp.now(),

                updatedAt: Timestamp.now()
            });

        return res.status(200).json(hospitalSpeciality);

    } catch (error) {

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
};

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

export const editHospitalSpeciality = async (
    req: Request,
    res: Response
) => {
    try {

        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        await updateHospitalSpeciality(id, req.body);
        return res.status(200).json({
            message: "Hospital speciality updated"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });

    }

};

export const removeHospitalSpeciality = async (
    req: Request,
    res: Response
) => {

    try {

        const id = hospitalDirectoryIdSchema.parse(req.params.id);

        await deleteHospitalSpeciality(id);

        return res.status(200).json({
            message: "Hospital speciality deleted"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }

};

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
