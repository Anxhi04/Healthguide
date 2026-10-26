import { Request, Response } from "express";
import {
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    createDoctor,
    getAllDoctors,
    getDoctorsByHospital,
    toPublicDoctor,
}from "../services/doctor.services"
import { createDoctorSchema } from "../validation/doctor.validation";
import { hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";
import { ZodError } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";
import { DoctorDirectoryError, getDoctorDirectory, getDoctorRelationships } from "../services/doctorDirectory.service";


export const createNewDoctor= async(
    req:Request,
    res:Response
)=>{
    try{
        const validatedData= createDoctorSchema.parse(req.body);
        const doctor = await createDoctor({
            ...validatedData,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()  
        });
        return res.status(200).json(doctor);
    }catch(error:any){
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

export const getDoctor= async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        const doctor= await getDoctorById(id);
        if(!doctor){
            return res.status(404).json({
                message:"Doctor not found"
            });
        }
        return res.status(200).json(toPublicDoctor(doctor))

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        });

    }
}
export const editDoctor = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        await updateDoctor(id, req.body);
        return res.status(200).json({
            message:"Doctor  updated"
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        })
    }
}
export const removeDoctor = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = hospitalDirectoryIdSchema.parse(req.params.id);
        await deleteDoctor(id);
        return res.status(200).json({
            message:"Doctor deleted"
        });
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getDoctors= async(
    req:Request,
    res:Response
)=>{
    try{
        const doctors = await getAllDoctors();
        return res.status(200).json(doctors.map(toPublicDoctor));
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const getDoctorsofHospital = async (
    req: Request,
    res: Response
) => {
    try {
        const hospitalId = hospitalDirectoryIdSchema.parse(req.params.hospitalId);

        const doctors = await getDoctorsByHospital(
            hospitalId
        );

        return res.status(200).json(doctors.map(toPublicDoctor));

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const directoryError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) return res.status(400).json({ message: error.issues[0]?.message });
    if (error instanceof DoctorDirectoryError) return res.status(error.statusCode).json({ message: error.message });
    console.error("Doctor directory/relationships request failed", error);
    return res.status(500).json({ message: "Could not load doctor information. Please try again." });
};
export const getDirectory = async (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "private, no-store");
    try { return res.status(200).json(await getDoctorDirectory()); }
    catch (error) { return directoryError(res, error); }
};
export const getRelationships = async (req: Request, res: Response) => {
    try { return res.status(200).json(await getDoctorRelationships(hospitalDirectoryIdSchema.parse(req.params.id))); }
    catch (error) { return directoryError(res, error); }
};

